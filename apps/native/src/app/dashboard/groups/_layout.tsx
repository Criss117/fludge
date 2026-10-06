import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function GroupsLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onBackground,
          fontFamily: GeistFonts.SemiBold,
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: t("screens.groups.create.label"),
        }}
      />
      <Stack.Screen
        name="[groupid]/update"
        options={{
          title: t("screens.groups.update.label"),
        }}
      />
      <Stack.Screen
        name="[groupid]/index"
        options={{
          title: t("screens.groups.detail.loading"),
        }}
      />
    </Stack>
  );
}
