import {
  AssistChip,
  Box,
  Button,
  Column,
  ElevatedCard,
  HorizontalDivider,
  Host,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxHeight,
  fillMaxWidth,
  height,
  paddingAll,
  Shapes,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CustomerPaymentSheet } from "@/core/commerce/components/customer-payment-sheet";
import { Icon } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  customer: CustomerSummary;
}

const CARD_HEIGHT = 300;

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
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

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
    <View style={{ width: "100%" }}>
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
              <Column modifiers={[weight(1)]}>
                <ThemedNativeText variant="h5" numberOfLines={1}>
                  {customer.name}
                </ThemedNativeText>
              </Column>
              <StatusChip status={customer.status as "active" | "inactive"} />
            </Row>

            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <AssistChip
                colors={{
                  containerColor: colors.surfaceContainerHigh,
                  labelColor: colors.onSurfaceVariant,
                  leadingIconContentColor: colors.onSurfaceVariant,
                }}
              >
                <AssistChip.LeadingIcon>
                  <Icon name="user-name" size={16} color={colors.onSurfaceVariant} />
                </AssistChip.LeadingIcon>
                <AssistChip.Label>
                  <ThemedNativeText color={colors.onSurfaceVariant} variant="sm">
                    {documentLabel}
                  </ThemedNativeText>
                </AssistChip.Label>
              </AssistChip>
            </Row>

            <Row
              modifiers={[fillMaxWidth()]}
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: SPACING.sm }}
            >
              <Icon name="phone" size={18} color={colors.outline} />
              <ThemedNativeText variant="muted">{customer.phone}</ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
            </Row>

            <Row
              modifiers={[fillMaxWidth()]}
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: SPACING.sm }}
            >
              <Icon name="mail" size={18} color={colors.outline} />
              <ThemedNativeText variant="muted">{customer.email ?? "-"}</ThemedNativeText>
            </Row>

            <HorizontalDivider
              thickness={1}
              color={colors.outlineVariant}
              modifiers={[fillMaxWidth()]}
            />

            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <ThemedNativeText variant="muted">
                {t("screens.customers.card.debt")}:{" "}
              </ThemedNativeText>
              <ThemedNativeText variant="h6" color={colors.error}>
                {formatCurrency(customer.balance)}
              </ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
              <ThemedNativeText variant="muted">
                {t("screens.customers.card.available_credit")}:{" "}
              </ThemedNativeText>
              <ThemedNativeText variant="h6">
                {formatCurrency(customer.creditLimit)}
              </ThemedNativeText>
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

            <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
              <ThemedNativeText variant="muted" color={textColor}>
                {percentage.toFixed(0)}% {t("screens.customers.card.used_credit")}
              </ThemedNativeText>
              <Spacer modifiers={[weight(1)]} />
              <Button
                colors={{
                  containerColor: colors.primary,
                }}
                onClick={() => setIsPaymentSheetOpen(true)}
              >
                <Icon name="dollar" size={18} color={colors.onPrimary} />
                <Spacer modifiers={[width(SPACING.sm)]} />
                <ThemedNativeText color={colors.onPrimary} variant="sm">
                  {t("screens.customers.card.pay")}
                </ThemedNativeText>
              </Button>
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
            </Row>
          </Column>
        </ElevatedCard>
      </Host>

      <CustomerPaymentSheet
        customer={customer}
        isOpen={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
      />
    </View>
  );
}
