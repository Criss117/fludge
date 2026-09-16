import { GeistFonts } from "@/integrations/fonts";
import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";

export default function ProductsLayout() {
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
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
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
        name="[productid]/index"
        options={{
          title: t("screens.products.product.loading_details"),
        }}
      />
      <Stack.Screen
        name="[productid]/update"
        options={{
          title: t("screens.products.update.title"),
        }}
      />
    </Stack>
  );
}
