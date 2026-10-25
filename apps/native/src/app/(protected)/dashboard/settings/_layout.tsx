import { Stack } from "expo-router";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

export default function SettingsLayout() {
  const colors = useThemeColor();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerShown: false,
        }}
      >
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
