import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";

type ReceiptCameraModalProps = {
    visible: boolean;
    onClose: () => void;
    onCapture: (base64Image: string) => Promise<void>;
};

export default function ReceiptCameraModal({ visible, onClose, onCapture }: ReceiptCameraModalProps) {
    const cameraRef = useRef<CameraView | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);

    const close = () => {
        setCameraReady(false);
        setTorchEnabled(false);
        onClose();
    };

    const capture = async () => {
        if (!cameraReady || !cameraRef.current || isCapturing) return;

        setIsCapturing(true);
        let photoUri: string | null = null;

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
            photoUri = photo.uri;

            if (!photo.base64) throw new Error("The camera couldn't read the captured image.");

            close();
            await onCapture(photo.base64);
        } catch (error) {
            Alert.alert("Receipt photo failed", error instanceof Error ? error.message : "Please try taking the photo again.");
        } finally {
            if (photoUri) await FileSystem.deleteAsync(photoUri, { idempotent: true }).catch(() => undefined);
            setIsCapturing(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={close}>
            <View className="flex-1 bg-black">
                {visible && (
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        enableTorch={torchEnabled}
                        onCameraReady={() => setCameraReady(true)}
                        onMountError={(event) => {
                            Alert.alert("Camera unavailable", event.message);
                            close();
                        }}
                    />
                )}

                <SafeAreaView className="flex-1 justify-between">
                    <View className="flex-row items-center justify-between px-5 pt-2">
                        <Pressable onPress={close} hitSlop={10} className="h-11 w-11 items-center justify-center rounded-full bg-black/45">
                            <Feather name="x" size={23} color="#FFFFFF" />
                        </Pressable>
                        <Text className="text-base font-semibold text-white">Scan receipt</Text>
                        <Pressable onPress={() => setTorchEnabled((current) => !current)} hitSlop={10} className="h-11 w-11 items-center justify-center rounded-full bg-black/45">
                            <Feather name={torchEnabled ? "zap" : "zap-off"} size={21} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    <View className="items-center px-6">
                        <View pointerEvents="none" style={{ width: "100%", aspectRatio: 0.72, maxHeight: 440, borderRadius: 16, borderWidth: 2, borderColor: "rgba(255,255,255,0.9)" }} />
                        <Text className="mt-5 rounded-full bg-black/55 px-4 py-2 text-center text-sm text-white">Align the receipt inside the frame</Text>
                    </View>

                    <View className="items-center pb-8">
                        <Pressable onPress={capture} disabled={!cameraReady || isCapturing} className="h-[76px] w-[76px] items-center justify-center rounded-full border-[5px] border-white">
                            {isCapturing ? <ActivityIndicator color="#FFFFFF" /> : <View className="h-[56px] w-[56px] rounded-full bg-white" />}
                        </Pressable>
                        <Text className="mt-3 text-sm text-white">{cameraReady ? "Take photo" : "Starting camera..."}</Text>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}
