import { Button, Host, HStack, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, frame, tint } from "@expo/ui/swift-ui/modifiers";
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
        <HStack spacing={SPACING.md}>
          <VStack
            modifiers={[
              frame({
                maxWidth: Infinity,
                alignment: "leading",
              }),
            ]}
            alignment="leading"
          >
            <ThemedNativeText variant="muted">{t("screens.pos.current_sale")}</ThemedNativeText>
            <ThemedNativeText variant="h5">
              {formatCurrency(activeTicket?.total ?? 0)}
            </ThemedNativeText>
          </VStack>

          <Button
            modifiers={[buttonStyle("borderedProminent"), tint(colors.primary)]}
            onPress={() => router.push("/pos/cart")}
          >
            <HStack
              modifiers={[
                frame({
                  maxWidth: Infinity,
                }),
              ]}
            >
              <ThemedNativeText color={colors.onPrimary}>
                {t("screens.pos.see_cart")}
              </ThemedNativeText>
              <Icon name="arrow-forward" size={20} color={colors.onPrimary} />
            </HStack>
          </Button>
        </HStack>
      </Host>

      <KeyboardSpacerView />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
