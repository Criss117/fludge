import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { ExpoDevMenuItem, registerDevMenuItems } from "expo-dev-menu";

import { useEffect } from "react";
import { RemountBoundary } from "@fludge/client/presentation/shared/remount-boundary";
import { bumpRemount } from "@fludge/client/shared/use-remount-epoch";

export default function DashboardLayout() {
  const backgroundColor = useThemeColor("background");

  useEffect(() => {
    if (!__DEV__) return;

    const items: ExpoDevMenuItem[] = [
      {
        name: "🔄 Remount current screen",
        callback: () => bumpRemount(),
      },
    ];

    registerDevMenuItems(items);
  }, []);

  return (
    <RemountBoundary>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor,
          },

          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="members" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="products" />
      </Stack>
    </RemountBoundary>
  );
}
