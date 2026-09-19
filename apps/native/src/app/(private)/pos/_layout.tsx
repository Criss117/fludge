import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

import { BackButton } from "@/modules/shared/components/back-button";
import { useTranslation } from "react-i18next";

export default function POSLayout() {
  const { t } = useTranslation();
  const [background, foreground] = useThemeColor(["background", "foreground"]);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: background,
        },
        headerStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: foreground,
          fontFamily: GeistFonts.SemiBold,
        },
        animation: "slide_from_right",
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="charge"
        options={{
          title: t("screens.charge.title"),
        }}
      />
    </Stack>
  );
}
