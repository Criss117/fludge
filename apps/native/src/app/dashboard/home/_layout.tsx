import { Platform } from "expo";
import * as Haptics from "expo-haptics";
import { NativeTabs } from "expo-router/native-tabs";
import { useTranslation } from "react-i18next";

import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isIos = Platform.OS === "ios";

function onTabPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function generateTabs() {
  const items = [
    {
      sf: { default: "cart", selected: "cart.fill" },
      md: "shopping_cart",
      name: "index",
      label: "screens.sales.label",
    },
    {
      sf: { selected: "person.2.fill", default: "person.2" },
      md: "people",
      name: "customer",
      label: "screens.customer.label",
    },
    {
      sf: {
        selected: "cube.box.fill",
        default: "cube.box",
      },
      md: "inventory_2",
      name: "(catalog)",
      label: "screens.catalog.label",
    },
    {
      sf: "shield.checkerboard",
      md: "security",
      name: "(iam)",
      label: "screens.iam.label",
    },
    {
      sf: { default: "gear.circle", selected: "gear.circle.fill" },
      md: "settings",
      name: "settings",
      label: "screens.settings.label",
    },
  ] as const;

  if (isIos) return items.filter((item) => item.name !== "settings");

  return items;
}

const tabs = generateTabs();

export default function DashboardLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const iconColor = isIos ? colors.primary : colors.onPrimary;

  return (
    <ThemedView style={{ flex: 1 }}>
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
