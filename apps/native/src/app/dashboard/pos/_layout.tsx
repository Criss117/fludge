import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function POSLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onPrimaryContainer,
          fontFamily: GeistFonts.Bold,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("screens.pos.label"),
        }}
      />
    </Stack>
  );
}
