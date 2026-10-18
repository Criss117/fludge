import { Column, HorizontalDivider, Host, IconButton, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { Ticket } from "@fludge/client/commerce/domain/local-ticket.repository";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

interface Props {
  ticket: Ticket & { total: number };
}

const RECEIPT_FONT_SIZE = 13;

export function ChargeSummarySection({ ticket }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <SectionCard
        title="screens.charge.sections.summary.title"
        action={
          <IconButton onClick={() => setIsOpen((prev) => !prev)}>
            <Icon name={isOpen ? "expand" : "chevron-right"} size={20} color={colors.outline} />
          </IconButton>
        }
      >
        <Column verticalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
          <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <ThemedNativeText variant="muted">
              {t("screens.charge.sections.summary.see_details")}
            </ThemedNativeText>
            <Spacer modifiers={[weight(1)]} />
            <ThemedNativeText variant="h5">{formatCurrency(ticket.total)}</ThemedNativeText>
          </Row>

          {isOpen && (
            <Column verticalArrangement={{ spacedBy: SPACING.md }}>
              {ticket.items.map((item, index) => (
                <Column key={item.id} verticalArrangement={{ spacedBy: SPACING.xs }}>
                  <Column
                    verticalArrangement={{ spacedBy: SPACING.xs }}
                    modifiers={[fillMaxWidth()]}
                  >
                    <ThemedNativeText variant="h6">{item.name}</ThemedNativeText>

                    {item.presentations.map((presentation) => (
                      <Row
                        key={presentation.id}
                        modifiers={[fillMaxWidth()]}
                        horizontalArrangement={{ spacedBy: SPACING.sm }}
                      >
                        <ThemedNativeText variant="muted" style={{ fontSize: RECEIPT_FONT_SIZE }}>
                          {presentation.name}
                        </ThemedNativeText>
                        <Spacer modifiers={[weight(1)]} />
                        <ThemedNativeText variant="muted" style={{ fontSize: RECEIPT_FONT_SIZE }}>
                          x{presentation.quantity}
                        </ThemedNativeText>
                        <ThemedNativeText style={{ fontSize: RECEIPT_FONT_SIZE }}>
                          {formatCurrency(presentation.priceSale * presentation.quantity)}
                        </ThemedNativeText>
                      </Row>
                    ))}

                    <Row modifiers={[fillMaxWidth()]}>
                      <ThemedNativeText variant="muted" style={{ fontSize: RECEIPT_FONT_SIZE - 2 }}>
                        {item.presentations.reduce((sum, p) => sum + p.quantity, 0)}{" "}
                        {t("helpers.items")}
                      </ThemedNativeText>
                      <Spacer modifiers={[weight(1)]} />
                      <ThemedNativeText variant="h6">
                        {formatCurrency(
                          item.presentations.reduce((sum, p) => sum + p.priceSale * p.quantity, 0),
                        )}
                      </ThemedNativeText>
                    </Row>
                  </Column>

                  {index < ticket.items.length - 1 && (
                    <HorizontalDivider color={colors.outlineVariant} modifiers={[fillMaxWidth()]} />
                  )}
                </Column>
              ))}

              <Row modifiers={[fillMaxWidth()]} verticalAlignment="center">
                <ThemedNativeText variant="h5">{t("helpers.total")}</ThemedNativeText>
                <Spacer modifiers={[weight(1)]} />
                <ThemedNativeText variant="h3">{formatCurrency(ticket.total)}</ThemedNativeText>
              </Row>
            </Column>
          )}
        </Column>
      </SectionCard>
    </Host>
  );
}
