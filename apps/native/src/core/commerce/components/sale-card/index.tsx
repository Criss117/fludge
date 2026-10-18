import {
  Button,
  Column,
  ElevatedCard,
  HorizontalDivider,
  Host,
  IconButton,
  ModalBottomSheet,
  Row,
  Spacer,
  SuggestionChip,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { SaleCardProps } from "./types";

const CARD_HEIGHT = 300;

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
    <Host style={{ width: "100%", height: CARD_HEIGHT }}>
      <ElevatedCard
        modifiers={[fillMaxWidth(), fillMaxHeight()]}
        colors={{
          containerColor: colors.onSecondary,
        }}
      >
        <Column
          modifiers={[fillMaxWidth(), fillMaxHeight(), paddingAll(SPACING.md)]}
          verticalArrangement={{ spacedBy: SPACING.sm }}
        >
          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="sm">#{sale.saleNumber}</ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <SuggestionChip
              colors={{
                containerColor: statusColor,
                labelColor: statusTextColor,
              }}
            >
              <SuggestionChip.Label>
                <ThemedNativeText color={statusTextColor}>
                  {statusLabels[sale.status] ?? sale.status}
                </ThemedNativeText>
              </SuggestionChip.Label>
            </SuggestionChip>
          </Row>

          <ThemedNativeText variant="h3">{formatCurrency(sale.total)}</ThemedNativeText>
          <SuggestionChip
            colors={{
              containerColor: colors.surfaceContainerHigh,
              labelColor: colors.onSurfaceVariant,
            }}
          >
            <SuggestionChip.Label>
              <ThemedNativeText color={colors.onSurfaceVariant}>
                {paymentTypeLabels[sale.paymentType] ?? sale.paymentType}
              </ThemedNativeText>
            </SuggestionChip.Label>
          </SuggestionChip>

          <HorizontalDivider
            thickness={1}
            color={colors.outlineVariant}
            modifiers={[fillMaxWidth()]}
          />

          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            <Icon name="person" size={18} color={colors.outline} />
            <Column>
              <ThemedNativeText variant="h6" maxLines={1}>
                {customer?.name ?? t("screens.sales.list.walk_in")}
              </ThemedNativeText>
              {customer && (
                <ThemedNativeText variant="muted" maxLines={1}>
                  {customer.documentType} {customer.documentNumber}
                </ThemedNativeText>
              )}
            </Column>
          </Row>

          <Spacer modifiers={[weight(1)]} />

          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            <Button
              onClick={() => setShowProducts(true)}
              modifiers={[weight(1)]}
              colors={{
                containerColor: colors.secondaryContainer,
                contentColor: colors.onSecondaryContainer,
              }}
            >
              <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: SPACING.sm }}>
                <Icon name="receipt" size={18} color={colors.onSecondaryContainer} />
                <ThemedNativeText color={colors.onSecondaryContainer}>
                  {t("screens.sales.list.receipt")}
                </ThemedNativeText>
              </Row>
            </Button>
            <IconButton>
              <Icon name="more-vert" size={24} color={colors.onSurface} />
            </IconButton>
          </Row>
        </Column>
      </ElevatedCard>

      {showProducts && (
        <ModalBottomSheet
          onDismissRequest={() => setShowProducts(false)}
          containerColor={colors.onSecondary}
        >
          <Column modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}>
            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <ThemedNativeText variant="h5">
                {t("screens.sales.list.see_products")}
              </ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
              <IconButton onClick={() => setShowProducts(false)}>
                <Icon name="close" size={24} color={colors.onSurface} />
              </IconButton>
            </Row>
            {sale.items.map((item) => (
              <Row
                key={item.id}
                modifiers={[fillMaxWidth()]}
                horizontalArrangement={{ spacedBy: SPACING.sm }}
              >
                <ThemedNativeText variant="base">{item.name}</ThemedNativeText>
                <Spacer modifiers={[weight(1)]} />
                <ThemedNativeText variant="muted">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </ThemedNativeText>
              </Row>
            ))}
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
