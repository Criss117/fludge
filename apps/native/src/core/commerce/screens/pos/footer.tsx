import { Button, Column, Host, Row } from "@expo/ui/jetpack-compose";
import { weight } from "@expo/ui/jetpack-compose/modifiers";
import { useActiveTicket } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

export function POSScreenFooter() {
  const router = useRouter();
  const { t } = useTranslation();
  const activeTicket = useActiveTicket();
  const colors = useThemeColor();

  return (
    <View style={styles.footer}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Row
          horizontalArrangement={{
            spacedBy: SPACING.md,
          }}
          verticalAlignment="center"
        >
          <Column modifiers={[weight(1)]}>
            <ThemedNativeText variant="muted">{t("screens.pos.current_sale")}</ThemedNativeText>
            <ThemedNativeText variant="h5">
              {formatCurrency(activeTicket?.total ?? 0)}
            </ThemedNativeText>
          </Column>

          <Button
            colors={{
              containerColor: colors.primary,
            }}
            modifiers={[weight(1)]}
            onClick={() => router.push("/pos/cart")}
          >
            <ThemedNativeText color={colors.onPrimary}>
              {t("screens.pos.see_cart")}
            </ThemedNativeText>
            <Icon name="arrow-forward" size={20} color={colors.onPrimary} />
          </Button>
        </Row>
      </Host>

      <KeyboardSpacerView />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
