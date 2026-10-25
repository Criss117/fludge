import { Platform } from "expo";
import { TopTabs } from "expo-router/js-top-tabs";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SegmentedTabBar } from "@/core/shared/components/segmented-tab-bar";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";

export default function IamLayout() {
  const colors = useThemeColor();
  const { top } = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, paddingTop: isIos ? 0 : top }}>
      <TopTabs
        tabBar={isIos ? SegmentedTabBar : undefined}
        screenOptions={{
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
        }}
      >
        <TopTabs.Screen
          name="index"
          options={{
            tabBarLabel: t("screens.iam.members.label"),
          }}
        />
        <TopTabs.Screen
          name="groups"
          options={{
            tabBarLabel: t("screens.iam.groups.label"),
          }}
        />
      </TopTabs>
    </ThemedView>
  );
}
