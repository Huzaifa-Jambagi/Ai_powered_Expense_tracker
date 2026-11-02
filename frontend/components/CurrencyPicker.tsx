import { Feather } from "@expo/vector-icons";
import CircleCountryFlag, {
  type CountryCode,
} from "react-native-circle-flags/country";
import cc from "currency-codes";
import getSymbol from "currency-symbol-map";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import countryToCurrency from "country-to-currency";


export type CurrencyEntry = {
  code: string;
  name: string;
  symbol: string;
};

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter((c) => c.symbol !== c.code);


const CURRENCY_FLAGS: Record<string, string> = {};

for (const [countryCode, currencyCode] of Object.entries(countryToCurrency)) {
  CURRENCY_FLAGS[currencyCode] ??= countryCode;
}

// Representative country for each currency
function CurrencyFlag({ code }: { code: string }) {
  if (code === "EUR") {
    return (
      <View className="w-14 h-14 rounded-full bg-[#30369C] items-center justify-center">
        <Text className="text-2xl">🇪🇺</Text>
      </View>
    );
  }

const countryCode = CURRENCY_FLAGS[code];

  if (!countryCode) {
    return (
      <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
        <Feather name="globe" size={24} color="#8A8D96" />
      </View>
    );
  }

  return (
    <CircleCountryFlag
      code={countryCode.toLowerCase() as CountryCode}
      size={56}
    />
  );
}

export function CurrencyPicker({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCode: string;
  onSelect: (currency: CurrencyEntry) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    if (!q) return ALL_CURRENCIES;

    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "bottom"]}
      >
        {/* Header */}
        <View className="px-5 pt-8 pb-6">
          <Text className="text-[32px] font-bold text-[#171717] mb-6">
            Choose a currency
          </Text>

          {/* Search */}
          <View className="flex-row items-center border border-[#A3A3A3] rounded-full px-5 h-[62px]">
            <Feather
              name="search"
              size={24}
              color="#8A8D96"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a currency / country"
              placeholderTextColor="#858585"
              className="flex-1 ml-3 text-[17px] text-[#171717]"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Currency List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 30,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelect(item);
                setSearch("");
              }}
              className="flex-row items-center py-5"
            >
              {/* Flag */}
              <View className="mr-5">
                <CurrencyFlag code={item.code} />
              </View>

              {/* Currency Information */}
              <View className="flex-1 justify-center">
                <Text className="text-[18px] font-semibold text-[#171717]">
                  {item.code}
                </Text>

                <Text
                  className="text-[17px] text-[#666666] mt-2"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              {/* Selected indicator */}
              {item.code === selectedCode && (
                <Feather
                  name="check"
                  size={20}
                  color="#2563EB"
                />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-[#8A8D96] text-base">
                No currencies found
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}