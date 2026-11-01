import { OnboardingFormValues, onboardingSchema } from "../../lib/schemas/onboardingSchema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ALL_CURRENCIES } from "../../components/CurrencyPicker";


export default function OnboardingScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onBlur",
    defaultValues: { startingBalance: "" },
  });
  const [selectedCurrency, setSelectedCurrency] = useState(
    ALL_CURRENCIES.find((c) => c.code === "INR") ?? ALL_CURRENCIES[0],
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <Text>OnboardingScreen</Text>
    </SafeAreaView>
  );
}