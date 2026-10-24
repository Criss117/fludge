import { Platform } from "expo";
import { NativeTabs } from "expo-router/native-tabs";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

const isAndroid = Platform.OS === "android";

export default function DashboardLayout() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const iconColor = isAndroid ? colors.onPrimary : colors.primary;

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
          sf={{ default: "cart", selected: "cart.fill" }}
          md="shopping_cart"
          selectedColor={iconColor}
        />
        <NativeTabs.Trigger.Label>{t("screens.sales.label")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="customer">
        <NativeTabs.Trigger.Icon
          sf={{ selected: "person.2.fill", default: "person.2" }}
          md="people"
          selectedColor={iconColor}
        />
        <NativeTabs.Trigger.Label>{t("screens.customer.label")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog">
        <NativeTabs.Trigger.Icon
          sf={{
            selected: "cube.box.fill",
            default: "cube.box",
          }}
          md="inventory_2"
          selectedColor={iconColor}
        />
        <NativeTabs.Trigger.Label>{t("screens.catalog.label")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="iam">
        <NativeTabs.Trigger.Icon sf="shield.checkerboard" md="security" selectedColor={iconColor} />
        <NativeTabs.Trigger.Label>{t("screens.iam.label")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {isAndroid && (
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon
            sf={{ default: "gear.circle", selected: "gear.circle.fill" }}
            md="settings"
            selectedColor={iconColor}
          />
          <NativeTabs.Trigger.Label>{t("screens.settings.label")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
