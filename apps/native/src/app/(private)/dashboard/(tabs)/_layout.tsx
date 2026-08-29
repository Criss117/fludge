import { MaterialIcons } from "@/modules/shared/components/icons";
import { UserButton } from "@/modules/shared/components/user-button";
import { useAppTheme } from "@/modules/shared/context/app-theme-context";
import { Tabs as ExpoTabs } from "expo-router";
import type { BottomTabDescriptorMap } from "expo-router/build/react-navigation/bottom-tabs/types";
import type {
  NavigationRoute,
  ParamListBase,
} from "expo-router/react-navigation";
import type { BottomTabBarProps } from "expo-router/tabs";
import { cn, useThemeColor } from "heroui-native";
import { Tabs } from "heroui-native/tabs";
import { useMemo } from "react";

const TabsIcons = {
  catalog: "inventory-2",
  index: "shopping-cart",
  clients: "people",
  iam: "security",
} as const;

function TabTrigger({
  route,
  descriptors,
  isFocused,
}: {
  route: NavigationRoute<ParamListBase, string>;
  descriptors: BottomTabDescriptorMap;
  isFocused: boolean;
}) {
  if (["_sitemap", "+not-found"].includes(route.name)) return null;

  const { options } = descriptors[route.key];

  const label = options.title ?? route.name;

  const iconName = TabsIcons[route.name as keyof typeof TabsIcons];

  return (
    <Tabs.Trigger
      value={route.key}
      key={route.key}
      className="w-1/4 flex-col gap-y-0 rounded-full"
    >
      <MaterialIcons
        name={iconName}
        className={cn(!isFocused ? "text-muted" : "text-accent")}
        size={20}
      />
      <Tabs.Label className="text-[12px] font-bold">{label}</Tabs.Label>
    </Tabs.Trigger>
  );
}

function BottomTabs({ descriptors, state, navigation }: BottomTabBarProps) {
  const focused = useMemo(
    () => state.routes[state.index],
    [state.index, state.routes]
  );

  const onPress = (key: string) => {
    const route = state.routes.find((r) => r.key === key)!;
    const isFocused = route.key === focused.key;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <Tabs
      value={focused.key}
      onValueChange={onPress}
      className="absolute bottom-0 mx-3 mb-3"
    >
      <Tabs.List className="bg-accent rounded-full">
        <Tabs.ScrollView>
          <Tabs.Indicator />
          {state.routes.map((route) => (
            <TabTrigger
              key={route.key}
              route={route}
              descriptors={descriptors}
              isFocused={route.key === focused.key}
            />
          ))}
        </Tabs.ScrollView>
      </Tabs.List>
    </Tabs>
  );
}

export default function DashboardTabsLayout() {
  const [background] = useThemeColor(["background"]);
  const { isDark } = useAppTheme();

  return (
    <ExpoTabs
      tabBar={(props) => <BottomTabs {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: background,
        },
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: isDark ? "white" : "black",
        },
        headerRight: () => <UserButton />,
        animation: "shift",
      }}
    >
      <ExpoTabs.Screen
        name="index"
        options={{
          title: "Ventas",
        }}
      />
      <ExpoTabs.Screen
        name="catalog"
        options={{
          title: "Inventario",
        }}
      />
      <ExpoTabs.Screen
        name="clients"
        options={{
          title: "Clientes",
        }}
      />
      <ExpoTabs.Screen
        name="iam"
        options={{
          title: "IAM",
        }}
      />
    </ExpoTabs>
  );
}
