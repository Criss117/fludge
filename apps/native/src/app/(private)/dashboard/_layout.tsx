import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function DashboardLayout() {
  const backgroundColor = useThemeColor("background");

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
}
