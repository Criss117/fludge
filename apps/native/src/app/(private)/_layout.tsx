import { SyncDatabase } from "@/integrations/db/sync";
import { HeroUIProvider } from "@/integrations/heroui";
import { Text } from "@/modules/shared/components/app-text";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import {
  OrganizationProvider,
  useOrganization,
} from "@fludge/client/providers/organization.provider";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Suspense } from "react";

function StackOptions() {
  const { activeOrganization } = useOrganization();
  const backgroundColor = useThemeColor("background");

  const hasActiveOrganization = activeOrganization !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="dashboard" />
      </Stack.Protected>
      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="pos" />
      </Stack.Protected>
      <Stack.Screen name="organization" />
    </Stack>
  );
}

export default function PrivateLayout() {
  return (
    <SyncDatabase>
      <OrganizationProvider
        fallback={<LoadingScreen message="app.loading_organization" />}
      >
        <HeroUIProvider>
          <StackOptions />
        </HeroUIProvider>
      </OrganizationProvider>
    </SyncDatabase>
  );
}
