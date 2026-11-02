import { BottomSheet, Button, Host, RNHostView } from "@expo/ui";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { SaleReceipt } from ".";
import type { SaleReceiptProps } from "./types";

export function SaleReceiptSheet({
  receipt,
  buttonVarian = "complete",
}: SaleReceiptProps & {
  buttonVarian?: "onlyIcon" | "complete";
}) {
  const [showProducts, setShowProducts] = useState(false);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowProducts(true);
  };

  return (
    <>
      <Host matchContents ignoreSafeArea="all">
        <Button onPress={open} variant="outlined">
          <Icon name="receipt" size={18} color={colors.onSecondaryContainer} />
          {buttonVarian === "complete" && (
            <ThemedNativeText color={colors.onSecondaryContainer}>
              {t("screens.sales.list.receipt")}
            </ThemedNativeText>
          )}
        </Button>
      </Host>
      <Host matchContents ignoreSafeArea="all">
        <BottomSheet
          isPresented={showProducts}
          onDismiss={() => setShowProducts(false)}
          showDragIndicator
          containerColor={colors.onSecondary}
        >
          <RNHostView>
            <ScrollView
              contentContainerStyle={styles.receiptContainer}
              showsVerticalScrollIndicator={false}
            >
              <SaleReceipt receipt={receipt} />
            </ScrollView>
          </RNHostView>
        </BottomSheet>
      </Host>
    </>
  );
}

const styles = StyleSheet.create({
  receiptButton: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xl,
  },
  receiptContainer: {
    padding: SPACING.md,
  },
});
