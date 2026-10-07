import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const colors = useThemeColor();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "slide_from_right",
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
