import { LoadingScreen } from "@/core/shared/components/loading-screen";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
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
          backgroundColor: colors.primaryContainer,
        },
        contentStyle: {
          backgroundColor: colors.primaryContainer,
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
    </Stack>
  );
}

export default function DashboardLayout() {
  return (
    <OrganizationProvider
      fallback={<LoadingScreen message="app.loading.organization" />}
    >
      <StackScreen />
    </OrganizationProvider>
  );
}
