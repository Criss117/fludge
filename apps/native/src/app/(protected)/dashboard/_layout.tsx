import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SyncDatabase } from "@/integrations/db/sync";
import { GeistFonts } from "@/integrations/fonts";

function StackScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();

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
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          title: t("screens.dashboard.label"),
          headerTitleStyle: {
            color: colors.primary,
            fontFamily: GeistFonts.Medium,
          },
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          title: t("screens.iam.members.label"),
        }}
      />
      <Stack.Screen
        name="groups"
        options={{
          title: t("screens.iam.groups.label"),
        }}
      />
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
