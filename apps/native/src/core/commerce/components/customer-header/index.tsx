import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  customer: CustomerSummary;
}

type SymbolConfig = {
  ios: "phone" | "envelope";
  android: "call" | "mail";
};

const SYMBOLS = {
  phone: { ios: "phone", android: "call" },
  mail: { ios: "envelope", android: "mail" },
} satisfies Record<string, SymbolConfig>;

function getDebtLevel(balance: number, creditLimit: number) {
  const percentage =
    creditLimit > 0 ? Math.min(100, (balance / creditLimit) * 100) : balance > 0 ? 100 : 0;

  if (percentage >= 75) return { percentage, color: "error" as const };
  if (percentage > 50) return { percentage, color: "warning" as const };
  return { percentage, color: "success" as const };
}

function ContactRow({ symbol, value }: { symbol: SymbolConfig; value: string }) {
  const colors = useThemeColor();

  return (
    <View style={styles.contactItem}>
      <SymbolView name={symbol} size={18} tintColor={colors.outline} />
      <ThemedText variant="muted" numberOfLines={1} style={styles.contactValue}>
        {value}
      </ThemedText>
    </View>
  );
}

export function CustomerHeader({ customer }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

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
    <View style={[styles.container, { backgroundColor: colors.onSecondary }]}>
      <View style={styles.identity}>
        <View style={styles.statusInfo}>
          <StatusChip status={customer.status as "active" | "inactive"} />
          <ThemedText variant="muted" numberOfLines={1} style={styles.documentLabel}>
            {documentLabel}
          </ThemedText>
        </View>
        <ThemedText variant="h4" numberOfLines={1}>
          {customer.name}
        </ThemedText>
      </View>

      <View style={styles.contactList}>
        <ContactRow symbol={SYMBOLS.phone} value={customer.phone} />
        <ContactRow symbol={SYMBOLS.mail} value={customer.email ?? "-"} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

      <View style={styles.debtSection}>
        <View style={styles.debtRow}>
          <View style={styles.debtColumn}>
            <ThemedText variant="muted">{t("screens.customers.card.debt")}</ThemedText>
            <ThemedText variant="h6" style={{ color: colors.error }}>
              {formatCurrency(customer.balance)}
            </ThemedText>
          </View>
          <View style={styles.creditColumn}>
            <ThemedText variant="muted">{t("screens.customers.card.available_credit")}</ThemedText>
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

        <ThemedText variant="muted" style={{ color: textColor }}>
          {percentage.toFixed(0)}% {t("screens.customers.card.used_credit")}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SPACING.xl,
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  identity: {
    rowGap: SPACING.sm,
  },
  statusInfo: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
  },
  documentLabel: {
    flexShrink: 1,
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
  contactValue: {
    flexShrink: 1,
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
    columnGap: SPACING.md,
  },
  debtColumn: {
    flexShrink: 1,
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
});
