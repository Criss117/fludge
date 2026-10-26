import { getI18nKey } from "@fludge/utils/validators/shared";
import { Stack } from "expo-router";
import { useState } from "react";
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

function StackConfig({ selectedScreen }: { selectedScreen: (typeof SCREENS)[number] }) {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t(selectedScreen.label),
        }}
      />
    </>
  );
}

export default function ProductsLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [selectedScreen, setSelectedScreen] = useState(SCREENS[0]);

  return (
    <>
      <StackConfig selectedScreen={selectedScreen} />
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
            listeners={{
              focus: () => {
                setSelectedScreen(screen as typeof selectedScreen);
              },
            }}
            options={{
              title: t(screen.label),
            }}
          />
        ))}
        {/* <Stack.Screen
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
        /> */}
      </Stack>
    </>
  );
}
