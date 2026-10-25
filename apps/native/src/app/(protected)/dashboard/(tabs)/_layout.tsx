import { Platform } from "expo";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TabsDropdownMenu } from "@/core/shared/components/tabs-dropdown-menu";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

function onTabPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const tabs = [
  {
    sf: { default: "cart", selected: "cart.fill" },
    md: "shopping_cart",
    name: "index",
    label: "screens.sales.label",
  },
  {
    sf: { selected: "person.2.fill", default: "person.2" },
    md: "people",
    name: "customers",
    label: "screens.customers.label",
  },
  {
    sf: {
      selected: "cube.box.fill",
      default: "cube.box",
    },
    md: "inventory_2",
    name: "catalog",
    label: "screens.catalog.label",
  },
] as const;

function StackHeaderContent({ selectedTab }: { selectedTab: (typeof tabs)[number] }) {
  const { t } = useTranslation();
  const router = useRouter();

  const navigateTo = () => {
    switch (selectedTab.name) {
      case "index":
        router.push("/pos");
        break;
      case "customers":
        router.push("/dashboard/customers/create");
        break;
      case "catalog":
        router.push("/dashboard/products/create");
        break;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t(selectedTab.label),
          headerRight: isAndroid ? () => <TabsDropdownMenu /> : undefined,
        }}
      />
      {isIos && (
        <>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button icon="plus" onPress={navigateTo} />
          </Stack.Toolbar>

          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Menu icon="gear">
              <Stack.Toolbar.MenuAction
                icon="gear"
                onPress={() => router.push("/dashboard/settings")}
              >
                {t("screens.settings.label")}
              </Stack.Toolbar.MenuAction>

              <Stack.Toolbar.MenuAction icon="person.2">
                {t("screens.iam.members.label")}
              </Stack.Toolbar.MenuAction>

              <Stack.Toolbar.MenuAction icon="cube.box">
                {t("screens.iam.groups.label")}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          </Stack.Toolbar>
        </>
      )}
    </>
  );
}

export default function DashboardLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  const iconColor = isIos ? colors.primary : colors.onPrimary;

  return (
    <ThemedView style={{ flex: 1 }}>
      <StackHeaderContent selectedTab={selectedTab} />
      <NativeTabs
        backgroundColor={colors.secondaryContainer}
        iconColor={colors.primary}
        rippleColor={colors.onPrimary}
        indicatorColor={colors.primary}
        labelStyle={{
          color: colors.primary,
          fontFamily: GeistFonts.Medium,
        }}
      >
        {tabs.map((tab) => (
          <NativeTabs.Trigger
            key={tab.name}
            name={tab.name}
            listeners={{
              tabPress: onTabPress,
              focus: () => setSelectedTab(tab as typeof selectedTab),
            }}
          >
            <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} selectedColor={iconColor} />
            <NativeTabs.Trigger.Label>{t(tab.label)}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    </ThemedView>
  );
}
