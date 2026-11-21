import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
} from "expo-audio";
import { ExtractedTransaction, extractTransactionFromVoice } from "../service/transactionAi";


export const MAX_VOICE_DURATION = 12_000;
const VOICE_RECORDING_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64_000 };
const resetAudioMode = () => setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

export function useVoiceEntry(onExtracted: (value: ExtractedTransaction) => void) {
    const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const actionInProgressRef = useRef(false);
    const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAutoStop = () => {
        if (!autoStopTimeoutRef.current) return;
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
    };

    const processRecording = async () => {
        if (actionInProgressRef.current) return;

        actionInProgressRef.current = true;
        clearAutoStop();
        setIsRecording(false);
        setIsProcessing(true);

        let audioUri: string | null = null;
        let audioModeReset = false;

        try {
            const status = audioRecorder.getStatus();

            if (status.isRecording) await audioRecorder.stop();

            await resetAudioMode();
            audioModeReset = true;

            audioUri = audioRecorder.uri;
            if (!audioUri) throw new Error("Couldn't access the audio recording.");
            if (status.durationMillis < 700) throw new Error("The recording was too short. Please try again.");

            const base64Audio = await FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 });
            if (!base64Audio) throw new Error("Couldn't read the audio recording.");

            const extracted = await extractTransactionFromVoice(base64Audio, "audio/m4a");

            if (extracted.amount === null && extracted.category === null && extracted.description === null && extracted.date === null) {
                Alert.alert("Transaction not recognized", "Couldn't identify transaction details in that recording. Please try again.");
                return;
            }

            onExtracted(extracted);
        } catch (error) {
            Alert.alert("Voice entry failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            if (!audioModeReset) await resetAudioMode().catch(() => undefined);
            if (audioUri) await FileSystem.deleteAsync(audioUri, { idempotent: true }).catch(() => undefined);

            setIsProcessing(false);
            setIsModalVisible(false);
            actionInProgressRef.current = false;
        }
    };

    const startRecording = async () => {
        if (actionInProgressRef.current || isRecording) return;

        actionInProgressRef.current = true;

        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Microphone permission required", "Allow microphone access to use voice entry.");
                return;
            }

            await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            setIsRecording(true);
            setIsModalVisible(true);

            autoStopTimeoutRef.current = setTimeout(() => void processRecording(), MAX_VOICE_DURATION);
        } catch (error) {
            await resetAudioMode().catch(() => undefined);
            Alert.alert("Voice recording failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            actionInProgressRef.current = false;
        }
    };

    const stopRecording = () => {
        if (actionInProgressRef.current || !isRecording) return;
        void processRecording();
    };

    const discardRecording = useCallback(async () => {
        clearAutoStop();

        try {
            if (audioRecorder.getStatus().isRecording) await audioRecorder.stop();
        } catch {}

        try {
            if (audioRecorder.uri) await FileSystem.deleteAsync(audioRecorder.uri, { idempotent: true });
        } catch {}

        await resetAudioMode().catch(() => undefined);
    }, [audioRecorder]);

    const cancelRecording = async () => {
        if (actionInProgressRef.current) return;

        actionInProgressRef.current = true;

        try {
            await discardRecording();
            setIsRecording(false);
            setIsModalVisible(false);
        } finally {
            actionInProgressRef.current = false;
        }
    };

    useEffect(() => () => {
        void discardRecording();
    }, [discardRecording]);

    return { isModalVisible, isRecording, isProcessing, startRecording, stopRecording, cancelRecording };
}