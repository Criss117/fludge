import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { AmountInput } from "./amount-input";

interface Props {
  total: number;
}

export function AmountReceivedSection({ total }: Props) {
  const [amount, setAmount] = useState(total);
  const { t } = useTranslation();
  const colors = useThemeColor();

  const change = amount - total;
  const isEnough = change >= 0;

  return (
    <View style={styles.container}>
      <AmountInput amount={amount} setAmount={setAmount} />

      <View
        style={[
          styles.resubmittedContent,
          {
            backgroundColor: isEnough ? colors.success : colors.errorContainer,
          },
        ]}
      >
        <View>
          <ThemedText
            style={{
              color: isEnough ? colors.onSuccess : colors.onErrorContainer,
            }}
          >
            {t("screens.charge.sections.amount_received.resubmitted.title")}
          </ThemedText>
          <ThemedText
            style={{
              color: isEnough ? colors.onSuccess : colors.onErrorContainer,
            }}
            variant="muted"
          >
            {t("screens.charge.sections.amount_received.resubmitted.description")}
          </ThemedText>
        </View>
        <ThemedText
          variant="h3"
          style={{
            color: isEnough ? colors.onSuccess : colors.onErrorContainer,
          }}
        >
          {formatCurrency(change)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    rowGap: SPACING.md,
  },
  host: {
    width: "100%",
  },
  resubmittedContent: {
    justifyContent: "space-between",
    padding: SPACING.md,
    borderRadius: SPACING.xl,
  },
});
