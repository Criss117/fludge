import { getI18nKey } from "@fludge/utils/validators/shared";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const SCREENS = [
  {
    name: "create",
    label: getI18nKey("screens.products.create.title"),
  },
  {
    name: "[productid]/update",
    label: getI18nKey("screens.products.update.title"),
  },
  {
    name: "[productid]/index",
    label: getI18nKey("screens.products.detail.loading"),
  },
] as const;

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
      {SCREENS.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: t(screen.label),
          }}
        />
      ))}
    </Stack>
  );
}
