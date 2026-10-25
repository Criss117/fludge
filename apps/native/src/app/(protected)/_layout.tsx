import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

export default function ProtectedLayout() {
  const { t } = useTranslation();
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
      <Stack.Protected guard={!hasActiveOrganization} redirectTo="/dashboard/(tabs)">
        <Stack.Screen name="organization" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization} redirectTo="/organization">
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="pos" />
      </Stack.Protected>
    </Stack>
  );
}
