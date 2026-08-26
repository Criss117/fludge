import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function AuthLayout() {
  const background = useThemeColor("background");

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: background,
        },
        animation: "fade",
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
