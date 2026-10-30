import { BottomSheet, Host, RNHostView } from "@expo/ui";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { SaleReceipt } from "@/core/commerce/components/sale-receipt";
import { Icon } from "@/core/shared/components/icon";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { SaleCardProps } from "./types";

export function SaleCard({ sale }: SaleCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [showProducts, setShowProducts] = useState(false);

  const statusLabels: Record<string, string> = {
    open: t("screens.sales.status.open"),
    partial: t("screens.sales.status.partial"),
    completed: t("screens.sales.status.completed"),
    cancelled: t("screens.sales.status.cancelled"),
  };

  const paymentTypeLabels: Record<string, string> = {
    cash: t("screens.sales.payment_type.cash"),
    credit: t("screens.sales.payment_type.credit"),
  };

  const statusColor =
    sale.status === "completed"
      ? colors.success
      : sale.status === "cancelled"
        ? colors.error
        : sale.status === "partial"
          ? colors.tertiary
          : colors.primary;

  const statusTextColor =
    sale.status === "completed"
      ? colors.onSuccess
      : sale.status === "cancelled"
        ? colors.onError
        : sale.status === "partial"
          ? colors.onTertiary
          : colors.onPrimary;

  const customer = sale.customer;

  return (
    <View style={[styles.container, { backgroundColor: colors.onSecondary }]}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <ThemedText variant="muted">#{sale.saleNumber}</ThemedText>
          <View style={[styles.chip, { backgroundColor: statusColor }]}>
            <ThemedText variant="sm" style={{ color: statusTextColor }}>
              {statusLabels[sale.status] ?? sale.status}
            </ThemedText>
          </View>
        </View>

        <ThemedText variant="h3">{formatCurrency(sale.total)}</ThemedText>

        <View
          style={[styles.chip, styles.selfStart, { backgroundColor: colors.surfaceContainerHigh }]}
        >
          <ThemedText variant="sm" style={{ color: colors.onSurfaceVariant }}>
            {paymentTypeLabels[sale.paymentType] ?? sale.paymentType}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

        <View style={styles.customerRow}>
          <Host matchContents ignoreSafeArea="all">
            <Icon name="person" size={18} color={colors.outline} />
          </Host>
          <View style={styles.customerInfo}>
            <ThemedText variant="h6" numberOfLines={1}>
              {customer?.name ?? t("screens.sales.list.walk_in")}
            </ThemedText>
            {customer && (
              <ThemedText variant="muted" numberOfLines={1}>
                {customer.documentType} {customer.documentNumber}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.receiptButton, { backgroundColor: colors.secondaryContainer }]}
            onPress={() => setShowProducts(true)}
          >
            <Host matchContents ignoreSafeArea="all">
              <Icon name="receipt" size={18} color={colors.onSecondaryContainer} />
            </Host>
            <ThemedText style={{ color: colors.onSecondaryContainer }}>
              {t("screens.sales.list.receipt")}
            </ThemedText>
          </Pressable>
          <Host matchContents ignoreSafeArea="all">
            <Icon name="more-vert" size={24} color={colors.onSurface} />
          </Host>
        </View>
      </View>

      <Host matchContents ignoreSafeArea="all">
        <BottomSheet
          isPresented={showProducts}
          onDismiss={() => setShowProducts(false)}
          showDragIndicator
          containerColor={colors.onSecondary}
        >
          <RNHostView>
            <View style={styles.receiptContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <SaleReceipt sale={sale} />
              </ScrollView>
            </View>
          </RNHostView>
        </BottomSheet>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SPACING.xl,
  },
  contentContainer: {
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.lg,
  },
  selfStart: {
    alignSelf: "flex-start",
  },
  divider: {
    height: 1,
  },
  customerRow: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
  },
  customerInfo: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: SPACING.md,
  },
  receiptButton: {
    flex: 1,
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
