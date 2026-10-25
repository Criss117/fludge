import { Platform } from "expo";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { HomeHeader } from "@/core/shared/components/home-header";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";

export default function IamLayout() {
  const { t } = useTranslation();
  const colors = useThemeColor();

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
        headerRight: () => {
          return <HomeHeader />;
        },
      }}
    >
      <Stack.Screen
        name="iam"
        options={{
          title: t("screens.iam.label"),
        }}
      />
    </Stack>
  );
}
