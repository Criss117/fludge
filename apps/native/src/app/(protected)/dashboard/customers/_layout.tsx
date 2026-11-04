import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const SCREENS = [
  {
    name: "create",
    label: getI18nKey("screens.customers.create.title"),
  },
  {
    name: "[customerid]/update",
    label: getI18nKey("screens.customers.update.title"),
  },
  {
    name: "[customerid]/index",
    label: getI18nKey("screens.customers.detail.loading"),
  },
] as const;

export default function CustomersLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
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
