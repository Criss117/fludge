import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ProductsLayout() {
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
          title: t("screens.products.create.title"),
        }}
      />
      <Stack.Screen
        name="[productid]/update"
        options={{
          title: t("screens.products.update.title"),
        }}
      />
      <Stack.Screen
        name="[productid]/index"
        options={{
          title: t("screens.products.detail.loading"),
        }}
      />
    </Stack>
  );
}
