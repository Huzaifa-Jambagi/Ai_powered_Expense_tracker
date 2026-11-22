import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAccountsQuery } from "../../../../hooks/useAccounts";
import { useCreateAccountMutation } from "../../../../hooks/useAccountMutation";
import { useUser as useBackendUserQuery } from "../../../../hooks/useUser";
import { useUpdateCurrencyMutation } from "../../../../hooks/updateCurrencyMutation";
import { userStorage } from "../../../../lib/store";

import { AddAccountModal } from "../../../../components/Profile/AddAccountModal";
import type { AddAccountForm } from "../../../../components/Profile/AddAccountModal";
import { ProfileHeader } from "../../../../components/Profile/ProfileHeader";
import { ProUpgradeCard } from "../../../../components/Profile/ProUpgradeCard";
import { AccountsSection } from "../../../../components/Profile/AccountsSection";
import { PreferencesSection } from "../../../../components/Profile/PreferencesSection";
import { CurrencyPicker } from "../../../../components/CurrencyPicker";

export default function ProfileScreen() {
    const router = useRouter();
    const accountsQuery = useAccountsQuery();
    const userQuery = useBackendUserQuery(false);

    const createAccountMutation = useCreateAccountMutation();
    const updateCurrencyMutation = useUpdateCurrencyMutation();

    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);

    const user = userStorage.getUser();
    const currency = userQuery.data?.currency ?? user?.currency ?? "INR";

    const handleCreateAccount = async (values: AddAccountForm) => {
        try {
            await createAccountMutation.mutateAsync(values);
            setIsAddAccountOpen(false);
        } catch {
            // Mutation handles the error Alert.
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <ProfileHeader />

                <ProUpgradeCard onPress={() => {}} />

                <AccountsSection
                    accounts={accountsQuery.data ?? []}
                    currency={currency}
                    isLoading={accountsQuery.isLoading}
                    onAddAccount={() => setIsAddAccountOpen(true)}
                    onAccountPress={account => router.push({
                        pathname: "/profile/[accountId]",
                        params: { accountId: account.id },
                    })}
                />

                <PreferencesSection
                    currency={currency}
                    onCurrencyPress={() => setIsCurrencyPickerOpen(true)}
                />
            </ScrollView>

            <AddAccountModal
                visible={isAddAccountOpen}
                onClose={() => setIsAddAccountOpen(false)}
                onSubmit={handleCreateAccount}
            />

            <CurrencyPicker
                visible={isCurrencyPickerOpen}
                selectedCode={currency}
                onSelect={selected => {
                    updateCurrencyMutation.mutate(selected.code);
                    setIsCurrencyPickerOpen(false);
                }}
                onClose={() => setIsCurrencyPickerOpen(false)}
            />
        </SafeAreaView>
    );
}