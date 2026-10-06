import { LoadingScreen } from "@/core/shared/components/loading-screen";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SyncDatabase } from "@/integrations/db/sync";
import {
  OrganizationProvider,
  useOrganization,
} from "@fludge/client/providers/organization.provider";
import { Stack } from "expo-router";

function StackScreen() {
  const colors = useThemeColor();
  const { activeOrganization } = useOrganization();

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
    </Stack>
  );
}

export default function DashboardLayout() {
  return (
    <SyncDatabase>
      <OrganizationProvider
        fallback={<LoadingScreen message="app.loading.organization" />}
      >
        <StackScreen />
      </OrganizationProvider>
    </SyncDatabase>
  );
}
