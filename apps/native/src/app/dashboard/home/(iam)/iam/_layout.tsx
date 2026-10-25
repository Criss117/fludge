import { Platform } from "expo";
import { Stack, useRouter } from "expo-router";
import { TopTabs } from "expo-router/js-top-tabs";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeHeaderActionButton } from "@/core/shared/components/home-header/index.ios";
import { SegmentedTabBar } from "@/core/shared/components/segmented-tab-bar";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";

export default function IamLayout() {
  const colors = useThemeColor();
  const { top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const currentTab = useRef<"members" | "groups">("members");
  const router = useRouter();

  const onFocus = (tab: "members" | "groups") => {
    if (!isIos) return;

    currentTab.current = tab;
  };

  const navigateTo = () => {
    if (currentTab.current === "members") {
      router.push("/dashboard/members/register");
    } else {
      router.push("/dashboard/groups/create");
    }
  };

  return (
    <ThemedView style={{ flex: 1, paddingTop: isIos ? 0 : top }}>
      <Stack.Screen
        options={{
          headerRight: () => <HomeHeaderActionButton icon="add" onPress={navigateTo} />,
        }}
      />
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
          listeners={{
            focus: () => onFocus("members"),
          }}
        />
        <TopTabs.Screen
          name="groups"
          options={{
            tabBarLabel: t("screens.iam.groups.label"),
          }}
          listeners={{
            focus: () => onFocus("groups"),
          }}
        />
      </TopTabs>
    </ThemedView>
  );
}
