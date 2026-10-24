import { SegmentedControl } from "@expo/ui/community/segmented-control";
import type { MaterialTopTabBarProps } from "expo-router/build/layouts/TopTabs.js";

import { HomeHeader } from "./home-header";

export function SegmentedTabBar({ state, descriptors, navigateToTab }: MaterialTopTabBarProps) {
  const values = state.routes.map((route) => {
    const { tabBarLabel, title } = descriptors[route.key].options;
    return typeof tabBarLabel === "string" ? tabBarLabel : (title ?? route.name);
  });

  return (
    <>
      <HomeHeader
        title="screens.iam.label"
        navigateTo={[
          {
            href: "/dashboard/members/register",
            icon: "add",
            key: "iam",
          },
          {
            href: "/dashboard/groups/create",
            icon: "add",
            key: "groups",
          },
        ]}
      />
      <SegmentedControl
        values={values}
        selectedIndex={state.index}
        onChange={(e) => {
          const route = state.routes[e.nativeEvent.selectedSegmentIndex];
          navigateToTab(route.key);
        }}
        style={{ marginHorizontal: 16, marginVertical: 8 }}
      />
    </>
  );
}
