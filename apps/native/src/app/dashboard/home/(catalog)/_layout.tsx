import { Platform } from "expo";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";

export default function CatalogLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: isIos,
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
      }}
    >
      <Stack.Screen
        name="catalog"
        options={{
          title: t("screens.catalog.label"),
        }}
      />
    </Stack>
  );
}
