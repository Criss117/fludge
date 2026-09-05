import { GeistFonts } from "@/integrations/fonts";
import { MaterialTopTabs } from "@/modules/shared/utils/material-top-tabs";
import type { MaterialTopTabNavigationOptions } from "expo-router/js-top-tabs";
import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";

export default function CatalogLayout() {
  const { t } = useTranslation();
  const [background, foreground, accent] = useThemeColor([
    "background",
    "foreground",
    "accent",
  ]);

  return (
    <MaterialTopTabs
      screenOptions={
        {
          tabBarActiveTintColor: foreground,
          tabBarPressColor: accent,
          sceneStyle: {
            backgroundColor: background,
          },
          tabBarStyle: {
            backgroundColor: background,
            shadowColor: "transparent",
          },
          tabBarLabelStyle: {
            fontFamily: GeistFonts.SemiBold,
          },

          tabBarIndicatorStyle: {
            backgroundColor: foreground,
          },
        } satisfies MaterialTopTabNavigationOptions
      }
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: t("screens.products.title"),
        }}
      />
      <MaterialTopTabs.Screen
        name="categories"
        options={{
          title: t("screens.categories.title"),
        }}
      />
    </MaterialTopTabs>
  );
}
