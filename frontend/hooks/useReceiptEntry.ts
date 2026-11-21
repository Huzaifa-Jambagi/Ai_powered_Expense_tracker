import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { ExtractedTransaction, extractTransactionFromReceipt } from "../service/transactionAi";


const MAX_RECEIPT_IMAGE_SIZE = 12 * 1024 * 1024;

export function useReceiptEntry(onExtracted: (value: ExtractedTransaction) => void) {
    const [cameraVisible, setCameraVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const processingRef = useRef(false);

    const openCamera = async () => {
        if (processingRef.current) return;

        try {
            const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();

            if (!permission.granted) {
                Alert.alert("Camera permission required", "Allow camera access to take a receipt photo.");
                return;
            }

            setCameraVisible(true);
        } catch {
            Alert.alert("Camera unavailable", "Couldn't request camera permission.");
        }
    };

    const processImage = async (base64Image: string) => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);

        try {
            if (base64Image.length * 0.75 > MAX_RECEIPT_IMAGE_SIZE) {
                throw new Error("That image is too large. Please capture a receipt smaller than 12 MB.");
            }

            const extracted = await extractTransactionFromReceipt(base64Image, "image/jpeg");

            if (extracted.amount === null && extracted.category === null && extracted.description === null && extracted.date === null) {
                Alert.alert("Receipt not recognized", "Couldn't identify transaction details. Try a clearer receipt photo.");
                return;
            }

            onExtracted(extracted);
        } catch (error) {
            Alert.alert("Receipt scanning failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    return {
        cameraVisible,
        isProcessing,
        openCamera,
        closeCamera: () => setCameraVisible(false),
        processImage,
    };
}