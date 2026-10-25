import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SyncDatabase } from "@/integrations/db/sync";
import { GeistFonts } from "@/integrations/fonts";

function StackScreen() {
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
      <Stack.Protected guard={!hasActiveOrganization} redirectTo="/dashboard/home">
        <Stack.Screen name="organization" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveOrganization} redirectTo="/dashboard/organization">
        <Stack.Screen name="home" />
        <Stack.Screen name="members" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="pos" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: t("screens.settings.label"),
            headerTitleStyle: {
              color: colors.primary,
              fontFamily: GeistFonts.Medium,
            },
            headerBackButtonDisplayMode: "minimal",
          }}
        />
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
