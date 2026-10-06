import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

export default function DashboardLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
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
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf="gear"
          md="shopping_cart"
          selectedColor={colors.onPrimary}
        />
        <NativeTabs.Trigger.Label>
          {t("screens.sales.label")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="customer">
        <NativeTabs.Trigger.Icon
          sf="gear"
          md="people"
          selectedColor={colors.onPrimary}
        />
        <NativeTabs.Trigger.Label>
          {t("screens.customer.label")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog">
        <NativeTabs.Trigger.Icon
          sf="gear"
          md="inventory_2"
          selectedColor={colors.onPrimary}
        />
        <NativeTabs.Trigger.Label>
          {t("screens.catalog.label")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="iam">
        <NativeTabs.Trigger.Icon
          sf="gear"
          md="security"
          selectedColor={colors.onPrimary}
        />
        <NativeTabs.Trigger.Label>
          {t("screens.iam.label")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
