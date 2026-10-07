import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function MembersLayout() {
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
        name="[memberid]/index"
        options={{
          title: t("screens.members.detail.loading"),
        }}
      />
      <Stack.Screen
        name="[memberid]/assign-groups"
        options={{
          title: t("screens.members.assign_groups.title"),
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: t("screens.members.register.label"),
        }}
      />
    </Stack>
  );
}
