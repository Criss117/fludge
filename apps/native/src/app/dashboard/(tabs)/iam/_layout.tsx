import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { MaterialTopTabs } from "@/lib/material-top-tabs";
import type { MaterialTopTabNavigationOptions } from "expo-router/js-top-tabs";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IamLayout() {
  const { top } = useSafeAreaInsets();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, paddingTop: top }}>
      <MaterialTopTabs
        screenOptions={
          {
            tabBarActiveTintColor: colors.primary,
            tabBarPressColor: colors.primary,
            tabBarStyle: {
              backgroundColor: colors.background,
              shadowColor: "transparent",
            },
            tabBarLabelStyle: {
              fontFamily: GeistFonts.SemiBold,
            },
            tabBarIndicatorStyle: {
              backgroundColor: colors.primary,
            },
            sceneStyle: {
              backgroundColor: colors.background,
            },
          } satisfies MaterialTopTabNavigationOptions
        }
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            tabBarLabel: t("screens.iam.members.label"),
          }}
        />
        <MaterialTopTabs.Screen
          name="groups"
          options={{
            tabBarLabel: t("screens.iam.groups.label"),
          }}
        />
      </MaterialTopTabs>
    </ThemedView>
  );
}
