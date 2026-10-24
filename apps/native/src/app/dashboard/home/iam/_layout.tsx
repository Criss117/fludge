import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { Platform } from "expo";
import type { MaterialTopTabBarProps } from "expo-router/js-top-tabs";
import { TopTabs } from "expo-router/js-top-tabs";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IamHeader } from "@/core/iam/components/iam-header";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

export function SegmentedTabBar({ state, descriptors, navigateToTab }: MaterialTopTabBarProps) {
  const values = state.routes.map((route) => {
    const { tabBarLabel, title } = descriptors[route.key].options;
    return typeof tabBarLabel === "string" ? tabBarLabel : (title ?? route.name);
  });

  return (
    <SegmentedControl
      values={values}
      selectedIndex={state.index}
      onChange={(e) => {
        const route = state.routes[e.nativeEvent.selectedSegmentIndex];
        navigateToTab(route.key);
      }}
      style={{ marginHorizontal: 16, marginVertical: 8 }}
    />
  );
}

const isIos = Platform.OS === "ios";

export default function IamLayout() {
  const { top } = useSafeAreaInsets();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <ThemedView style={{ flex: 1, paddingTop: top }}>
      {isIos && <IamHeader title="screens.iam.label" />}
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
