import { iamContainer } from "@/integrations/dependencies/iam.container";
import { ORGANIZATION_LOCAL_STORAGE_KEY } from "@/modules/shared/utils/constanst";
import { OrganizationStore } from "@/modules/shared/utils/organization-store";
import { useAuth } from "@fludge/client/providers/auth.provider";
import {
  IOrganizationStorage,
  OrganizationProvider,
  useOrganization,
} from "@fludge/client/providers/organization.provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

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
      organizationStorage={OrganizationStore}
      organizationRepository={iamContainer.repositories.organizationRepository}
    >
      <StackOptions />
    </OrganizationProvider>
  );
}
