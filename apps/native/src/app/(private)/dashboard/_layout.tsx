import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { ExpoDevMenuItem, registerDevMenuItems } from "expo-dev-menu";
import {
  resetAllResources,
  listRegisteredResources,
  resetResource,
} from "@fludge/client/shared/create-resource-collection";
import { useEffect } from "react";
import { RemountBoundary } from "@fludge/client/presentation/shared/remount-boundary";
import { bumpRemount } from "@fludge/client//shared/use-remount-epoch";

export default function DashboardLayout() {
  const backgroundColor = useThemeColor("background");
  useFindActiveOrganization();

  useEffect(() => {
    if (!__DEV__) return;

    const items: ExpoDevMenuItem[] = [
      {
        name: "🔄 Remount current screen",
        callback: () => bumpRemount(),
      },
      {
        name: "🧹 Reset ALL collections",
        callback: () => {
          resetAllResources();
          console.log("Todas las colecciones fueron reseteadas");
        },
      },
      ...listRegisteredResources().map((resourceName) => ({
        name: `🧹 Reset: ${resourceName}`,
        callback: () => resetResource(resourceName),
      })),
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
      </Stack>
    </RemountBoundary>
  );
}
