import { Button, Host } from "@expo/ui";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  customer: CustomerSummary;
  onDeselect: () => void;
}

function getDebtLevel(balance: number, creditLimit: number) {
  const percentage =
    creditLimit > 0 ? Math.min(100, (balance / creditLimit) * 100) : balance > 0 ? 100 : 0;

  if (percentage >= 75) return { percentage, color: "error" as const };
  if (percentage > 50) return { percentage, color: "warning" as const };
  return { percentage, color: "success" as const };
}

export function CustomerSaleCard({ customer, onDeselect }: Props) {
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

  return (
    <View style={[styles.card, { backgroundColor: colors.onSecondary }]}>
      <View style={styles.row}>
        <ThemedText variant="h5">{customer.name}</ThemedText>
        <Host matchContents>
          <Button onPress={onDeselect} variant="text">
            <Icon name="close" size={18} color={colors.outline} />
          </Button>
        </Host>
      </View>

      <View style={styles.row}>
        <ThemedText variant="muted">{t("screens.customers.card.debt")}</ThemedText>
        <ThemedText variant="h6">{formatCurrency(customer.balance)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText variant="muted">{t("screens.customers.card.credit_limit")}</ThemedText>
        <ThemedText variant="h6">{formatCurrency(customer.creditLimit)}</ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceContainerHigh }]}>
        {percentage > 0 && (
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: barColor }]} />
        )}
      </View>

      <View style={styles.rowEnd}>
        <ThemedText
          variant="muted"
          style={{
            color: textColor,
          }}
        >
          {Math.round(percentage)}% {t("screens.customers.card.debt")}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: SPACING.md,
    gap: SPACING.md,
    borderRadius: 12,
    // Equivalente a ElevatedCard
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowEnd: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  track: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
});
