import { Box, Column, ElevatedCard, Host, IconButton, Row, Spacer } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxHeight,
  fillMaxWidth,
  height,
  paddingAll,
  Shapes,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
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
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <ElevatedCard
        modifiers={[fillMaxWidth()]}
        colors={{
          containerColor: colors.onSecondary,
        }}
      >
        <Column
          modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
          verticalArrangement={{
            spacedBy: SPACING.md,
          }}
        >
          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="h5">{customer.name}</ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <IconButton onClick={onDeselect}>
              <Icon name="close" size={18} color={colors.outline} />
            </IconButton>
          </Row>

          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="muted">{t("screens.customers.card.debt")}</ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <ThemedNativeText variant="h6">{formatCurrency(customer.balance)}</ThemedNativeText>
          </Row>

          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="muted">
              {t("screens.customers.card.credit_limit")}
            </ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <ThemedNativeText variant="h6">{formatCurrency(customer.creditLimit)}</ThemedNativeText>
          </Row>

          <Row
            modifiers={[
              fillMaxWidth(),
              height(10),
              background(colors.surfaceContainerHigh),
              clip(Shapes.RoundedCorner(5)),
            ]}
          >
            {percentage > 0 && (
              <Box
                modifiers={[
                  fillMaxHeight(),
                  weight(percentage),
                  background(barColor),
                  clip(Shapes.RoundedCorner(5)),
                ]}
              />
            )}
            {percentage < 100 && <Spacer modifiers={[weight(100 - percentage)]} />}
          </Row>

          <Row modifiers={[fillMaxWidth()]}>
            <Spacer modifiers={[weight(1)]} />
            <ThemedNativeText variant="muted" color={textColor}>
              {percentage}% {t("screens.customers.card.debt")}
            </ThemedNativeText>
          </Row>
        </Column>
      </ElevatedCard>
    </Host>
  );
}
