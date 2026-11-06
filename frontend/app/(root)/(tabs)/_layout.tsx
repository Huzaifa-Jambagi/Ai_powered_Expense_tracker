
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

const useNativeTabs = Platform.OS === "ios";

export default function TabLayout() {
  if (useNativeTabs) {
    return (
      <NativeTabs
        backgroundColor="#0B0E14"
        tintColor="#C2185B"
        iconColor={{
          default: "#5C5F68",
          selected: "#C2185B",
        }}
        labelStyle={{
          default: { color: "#5C5F68" },
          selected: { color: "#C2185B" },
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="transactions">
          <NativeTabs.Trigger.Label>Transactions</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="list.bullet" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="add-transactions">
          <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus.circle.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="budgets">
          <NativeTabs.Trigger.Label>Budgets</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="chart.pie.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C2185B",
        tabBarInactiveTintColor: "#5C5F68",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8E6DF",
          paddingTop: 4,
          marginBottom: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-transactions"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budgets",
          tabBarIcon: ({ color, size }) => (
            <Feather name="pie-chart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
