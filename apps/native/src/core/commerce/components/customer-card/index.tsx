import { Host } from "@expo/ui";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { CustomerPaymentSheet } from "@/core/commerce/components/customer-payment-sheet";
import { Icon } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  customer: CustomerSummary;
}

function getDebtLevel(balance: number, creditLimit: number) {
  const percentage =
    creditLimit > 0 ? Math.min(100, (balance / creditLimit) * 100) : balance > 0 ? 100 : 0;

  if (percentage >= 75) return { percentage, color: "error" as const };
  if (percentage > 50) return { percentage, color: "warning" as const };
  return { percentage, color: "success" as const };
}

export function CustomerCard({ customer }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();

  const { percentage, color } = getDebtLevel(customer.balance, customer.creditLimit);

  const barColor =
    color === "error" ? colors.error : color === "warning" ? colors.tertiary : colors.success;

  const textColor =
    color === "error"
      ? colors.onErrorContainer
      : color === "warning"
        ? colors.onTertiaryContainer
        : colors.onSuccess;

  const documentLabel = `${customer.documentType} ${customer.documentNumber}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.onSecondary,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.statusInfo}>
            <StatusChip status={customer.status as "active" | "inactive"} />
            <ThemedText variant="muted" numberOfLines={1}>
              {documentLabel}
            </ThemedText>
          </View>
          <ThemedText numberOfLines={1} variant="h4">
            {customer.name}
          </ThemedText>
        </View>

        <View style={styles.contactList}>
          <View style={styles.contactItem}>
            <Host matchContents>
              <Icon name="phone" size={18} color={colors.outline} />
            </Host>
            <ThemedText variant="muted">{customer.phone}</ThemedText>
          </View>
          <View style={styles.contactItem}>
            <Host matchContents>
              <Icon name="mail" size={18} color={colors.outline} />
            </Host>
            <ThemedText variant="muted">{customer.email ?? "-"}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

        <View style={styles.debtSection}>
          <View style={styles.debtRow}>
            <View>
              <ThemedText variant="muted">{t("screens.customers.card.debt")}</ThemedText>
              <ThemedText variant="h6" style={{ color: colors.error }}>
                {formatCurrency(customer.balance)}
              </ThemedText>
            </View>
            <View style={styles.creditColumn}>
              <ThemedText variant="muted">
                {t("screens.customers.card.available_credit")}
              </ThemedText>
              <ThemedText variant="h6">{formatCurrency(customer.creditLimit)}</ThemedText>
            </View>
          </View>

          <View
            style={[styles.progressBarBackground, { backgroundColor: colors.surfaceContainerHigh }]}
          >
            {percentage > 0 && (
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.actionsRow}>
            <ThemedText variant="muted" style={{ color: textColor }}>
              {percentage.toFixed(0)}% {t("screens.customers.card.used_credit")}
            </ThemedText>
            <CustomerPaymentSheet customer={customer} />
          </View>
        </View>

        <View style={styles.menuOptions}>
          <Host matchContents ignoreSafeArea="all">
            <MenuOptions
              items={[
                {
                  label: "helpers.navigation.see_details",
                  action: () => {
                    // TODO: navigate to customer detail
                  },
                  icon: "eye",
                },
                {
                  label: "helpers.navigation.update",
                  action: () => {
                    router.push({
                      pathname: "/dashboard/customers/[customerid]/update",
                      params: { customerid: customer.id },
                    });
                  },
                  icon: "edit",
                },
              ]}
            />
          </Host>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SPACING.xl,
    position: "relative",
  },
  contentContainer: {
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  header: {
    rowGap: SPACING.sm,
  },
  statusInfo: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
  },
  contactList: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.sm,
  },
  contactItem: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
  },
  divider: {
    height: 1,
  },
  debtSection: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.sm,
  },
  debtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  creditColumn: {
    alignItems: "flex-end",
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  payButton: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xl,
  },
  menuOptions: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
});
