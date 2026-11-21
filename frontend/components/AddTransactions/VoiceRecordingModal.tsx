import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MAX_VOICE_DURATION } from "../../hooks/useVoiceEntry";


function formatDuration(durationMillis: number) {
    const totalSeconds = Math.floor(durationMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function VoiceRecordingModal({ visible, isRecording, isProcessing, onStop, onCancel }: {
    visible: boolean;
    isRecording: boolean;
    isProcessing: boolean;
    onStop: () => void;
    onCancel: () => void;
}) {
    const [durationMillis, setDurationMillis] = useState(0);
    const recordingStartedAtRef = useRef(0);

    useEffect(() => {
        if (!visible) {
            recordingStartedAtRef.current = 0;
            setDurationMillis(0);
            return;
        }

        if (isProcessing) {
            setDurationMillis(Math.min(Date.now() - recordingStartedAtRef.current, MAX_VOICE_DURATION));
            return;
        }

        recordingStartedAtRef.current = Date.now();

        const interval = setInterval(() => {
            setDurationMillis(Math.min(Date.now() - recordingStartedAtRef.current, MAX_VOICE_DURATION));
        }, 1000);

        return () => clearInterval(interval);
    }, [visible, isProcessing]);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
            <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="w-full rounded-[28px] bg-white p-6">
                    <View className="items-center">
                        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                            {isProcessing ? (
                                <ActivityIndicator size="large" color="#E11D48" />
                            ) : (
                                <Feather name="mic" size={28} color="#E11D48" />
                            )}
                        </View>

                        <Text className="text-xl font-bold text-slate-950">
                            {isProcessing ? "Processing your voice" : "Recording transaction"}
                        </Text>

                        <Text className="mt-2 text-center text-sm text-slate-500">
                            {isProcessing
                                ? "Transcribing and extracting transaction details…"
                                : "Speak naturally. Include the amount and what you spent it on."}
                        </Text>

                        <Text className="my-6 text-4xl font-semibold tabular-nums text-slate-950">
                            {formatDuration(durationMillis)}
                        </Text>

                        <View className="mb-6 flex-row items-center gap-2">
                            <View className={`h-2.5 w-2.5 rounded-full ${isRecording ? "bg-rose-500" : "bg-slate-300"}`} />
                            <Text className="text-sm text-slate-500">
                                {isProcessing ? "Please wait" : `Recording · ${MAX_VOICE_DURATION / 1000} second limit`}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={onCancel}
                            disabled={isProcessing}
                            className={`h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100 ${isProcessing ? "opacity-50" : ""}`}
                        >
                            <Text className="font-semibold text-slate-700">Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={onStop}
                            disabled={!isRecording || isProcessing}
                            className={`h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-rose-600 ${!isRecording || isProcessing ? "opacity-50" : ""}`}
                        >
                            <Feather name="square" size={15} color="#FFFFFF" />
                            <Text className="font-semibold text-white">Stop recording</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}