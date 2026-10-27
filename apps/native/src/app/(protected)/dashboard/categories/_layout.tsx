import { Stack } from "expo-router";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

function StackConfing() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="plus" />
      </Stack.Toolbar>
    </>
  );
}

export default function CategoriesLayout() {
  const colors = useThemeColor();

  return (
    <>
      <StackConfing />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
