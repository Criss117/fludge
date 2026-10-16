import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { Stack } from "expo-router";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SyncDatabase } from "@/integrations/db/sync";

function StackScreen() {
  const colors = useThemeColor();
  const {
    data: { activeOrganization },
  } = useAppState();

  const hasActiveOrganization = activeOrganization !== null;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!hasActiveOrganization}>
        <Stack.Screen name="organization" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="members" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="groups" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="pos" />
      </Stack.Protected>
    </Stack>
  );
}

export default function DashboardLayout() {
  return (
    <SyncDatabase>
      <StackScreen />
    </SyncDatabase>
  );
}
