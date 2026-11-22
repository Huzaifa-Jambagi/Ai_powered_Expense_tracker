import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const accountTypes = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "OTHER", label: "Other" },
] as const;

const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(50, "Name is too long"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]),
  openingBalance: z.string().trim().regex(/^\d+(\.\d+)?$/, "Enter a valid amount"),
});

export type AddAccountForm = z.infer<typeof accountSchema>;

type AddAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: AddAccountForm) => Promise<unknown> | void;
};

export function AddAccountModal({ visible, onClose, onSubmit }: AddAccountModalProps) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", type: "CASH", openingBalance: "0" },
  });

  useEffect(() => {
    if (!visible) {
      setKeyboardVisible(false);
      reset();
      return;
    }

    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, [visible, reset]);

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const submit = handleSubmit(async values => {
    await onSubmit(values);
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable
            className="absolute inset-0"
            onPress={close}
            disabled={isSubmitting}
          />

          <View
            className="w-full rounded-t-3xl bg-white px-5"
            style={{
              maxHeight: "100%",
              paddingTop: keyboardVisible ? 8 : 16,
              paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 24),
            }}
          >
            {/* Drag handle */}
            <View className="mb-3 items-center">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            {/* Header */}
            <View className="mb-4 h-10 flex-row items-center justify-center">
              <Pressable
                onPress={close}
                disabled={isSubmitting}
                className="absolute left-0 h-10 w-10 items-center justify-center"
              >
                <Text className="text-3xl leading-9 text-gray-900">×</Text>
              </Pressable>

              <Text className="text-xl font-bold text-gray-900">
                Add Account
              </Text>
            </View>

            {/* Account Name */}
            <Text className={`mb-2 text-base font-semibold text-gray-900 ${keyboardVisible ? "text-sm" : ""}`}>
              Account Name
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Personal Savings"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  className={`rounded-xl border border-gray-200 px-4 text-base text-gray-900 ${
                    keyboardVisible ? "h-11" : "h-12"
                  }`}
                />
              )}
            />

            {errors.name && (
              <Text className="mt-1 text-xs text-red-500">
                {errors.name.message}
              </Text>
            )}

            {/* Account Type */}
            <Text className={`mb-2 font-semibold text-gray-900 ${keyboardVisible ? "mt-3 text-sm" : "mt-5 text-base"}`}>
              Account Type
            </Text>

            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row gap-2">
                  {accountTypes.map(type => {
                    const selected = value === type.value;

                    return (
                      <Pressable
                        key={type.value}
                        onPress={() => onChange(type.value)}
                        className={`min-h-10 flex-1 items-center justify-center rounded-xl border px-1 ${
                          selected
                            ? "border-green-700 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-center text-xs font-semibold ${
                            selected ? "text-green-800" : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />

            {/* Opening Balance */}
            <Text className={`mb-2 font-semibold text-gray-900 ${keyboardVisible ? "mt-3 text-sm" : "mt-5 text-base"}`}>
              Opening Balance
            </Text>

            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className={`rounded-xl border border-gray-200 px-4 text-base text-gray-900 ${
                    keyboardVisible ? "h-11" : "h-12"
                  }`}
                />
              )}
            />

            {errors.openingBalance && (
              <Text className="mt-1 text-xs text-red-500">
                {errors.openingBalance.message}
              </Text>
            )}

            {/* Actions */}
            <View className={`gap-2.5 ${keyboardVisible ? "mt-3" : "mt-5"}`}>
              <Pressable
                onPress={submit}
                disabled={isSubmitting}
                className={`flex-row items-center justify-center gap-2 rounded-xl bg-green-800 active:bg-green-900 ${
                  keyboardVisible ? "h-11" : "h-14"
                }`}
              >
                {isSubmitting && (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
                <Text className="text-base font-bold text-white">
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Text>
              </Pressable>

              <Pressable
                onPress={close}
                disabled={isSubmitting}
                className={`items-center justify-center rounded-xl bg-pink-50 active:bg-pink-100 ${
                  keyboardVisible ? "h-11" : "h-14"
                }`}
              >
                <Text className="text-base font-bold text-pink-600">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}