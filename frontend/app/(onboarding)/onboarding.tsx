import { OnboardingFormValues, onboardingSchema } from "../../lib/schemas/onboardingSchema";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCompleteOnboarding } from "../../hooks/useOnboarding";
import { Feather } from "@expo/vector-icons";
import { CurrencyPicker, ALL_CURRENCIES } from "../../components/CurrencyPicker";
import Logo from "../../assets/Logo.svg";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";


export default function OnboardingScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onBlur",
    defaultValues: {
      startingBalance: "",
      currency: "INR",
    },
  });


  const {
    mutate: completeOnboarding,
    isPending,
    isError,
    error,
  } = useCompleteOnboarding();

  const onSubmit = (values: OnboardingFormValues) => {
    completeOnboarding({
      startingBalance: Number(values.startingBalance.replace(/,/g, "")),
      currency: values.currency,
    });
  };

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center px-6"
      >

        <View className="items-center pt-12 pb-5">
          <Logo width={148} height={162} />

          <Text className="text-3xl font-bold mt-4 mb-2 leading-tight text-[#1A1D26]">
            Almost Ready
          </Text>

          <Text className="text-brand-text-muted text-base text-center mb-6">
            Let’s Get You Set Up
          </Text>
        </View>

        <View className="w-full">
          <View className="flex-col gap-4 mb-4">
            <Controller
              control={control}
              name="startingBalance"
              render={({ field: { value, onChange, onBlur } }) => (
                <View className="flex-row items-center border border-[#E8E6DF] bg-white rounded-xl px-3 h-16">
                  <TextInput
                    className="flex-1 pl-3 text-[#1A1D26]"
                    placeholder="Balance"
                    placeholderTextColor="#8A8D96"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    underlineColorAndroid="transparent"
                    selectionColor="#2563EB"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="currency"
              render={({ field: { value, onChange } }) => {
                const selected = ALL_CURRENCIES.find((c) => c.code === value);

                return (
                  <>
                    <TouchableOpacity
                      onPress={() => setPickerOpen(true)}
                      className="flex-row items-center justify-between border border-[#E8E6DF] bg-white rounded-xl px-4 h-16"
                    >
                      <Text className="text-[#1A1D26]">
                        {selected?.symbol} {value}
                      </Text>

                      <Feather name="chevron-down" size={18} color="#8A8D96" />
                    </TouchableOpacity>

                    <CurrencyPicker
                      visible={pickerOpen}
                      selectedCode={value}
                      onSelect={(currency) => {
                        onChange(currency.code);
                        setPickerOpen(false);
                      }}
                      onClose={() => setPickerOpen(false)}
                    />
                  </>
                );
              }}
            />
          </View>

          {(formErrors.startingBalance || formErrors.currency) && (
            <Text className="text-brand-coral mb-2 text-sm">
              {formErrors.startingBalance?.message || formErrors.currency?.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className="bg-brand-blue py-4 w-full items-center rounded-xl mb-3"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Complete Setup</Text>
            )}
          </TouchableOpacity>
          {isError && (
            <Text className="text-brand-coral text-sm text-center">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </Text>
          )}

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}