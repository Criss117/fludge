import { iamContainer } from "@/integrations/dependencies/iam.container";
import { HeroUIProvider } from "@/integrations/heroui";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { OrganizationStore } from "@/modules/shared/utils/organization-store";
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
        <Stack.Screen name="sales" />
      </Stack.Protected>
      <Stack.Screen name="organization" />
    </Stack>
  );
}

export default function PrivateLayout() {
  return (
    <OrganizationProvider
      fallback={<LoadingScreen message="app.loading_organization" />}
      organizationStorage={OrganizationStore}
      organizationRepository={iamContainer.repositories.organizationRepository}
    >
      <HeroUIProvider>
        <Suspense
          fallback={<LoadingScreen message="app.loading_organization" />}
        >
          <StackOptions />
        </Suspense>
      </HeroUIProvider>
    </OrganizationProvider>
  );
}
