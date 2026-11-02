import { Host } from "@expo/ui";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { IconName } from "@/core/shared/components/icon";
import { Icon } from "@/core/shared/components/icon";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

type PaymentType = "cash" | "credit";

interface Props {
  paymentType: PaymentType;
  onPaymentTypeChange: (paymentType: PaymentType) => void;
}

const options: { type: PaymentType; icon: IconName; label: TranslationKey }[] = [
  {
    type: "cash",
    icon: "payments",
    label: "screens.charge.sections.payment_type.cash",
  },
  {
    type: "credit",
    icon: "credit-card",
    label: "screens.charge.sections.payment_type.credit",
  },
];

export function PaymentTypeSection({ paymentType, onPaymentTypeChange }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      <ThemedText variant="h5">{t("screens.charge.sections.payment_type.title")}</ThemedText>
      <View style={styles.row}>
        {options.map(({ type, icon, label }) => {
          const selected = paymentType === type;
          const foreground = selected ? colors.onPrimary : colors.onSurface;

          return (
            <Pressable
              key={type}
              onPress={() => onPaymentTypeChange(type)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceContainerHigh,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Host matchContents>
                <Icon name={icon} size={20} color={foreground} />
              </Host>
              <Text style={[styles.label, { color: foreground }]}>{t(label)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
