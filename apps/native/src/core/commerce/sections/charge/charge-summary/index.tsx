import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import type { Ticket } from "@fludge/client/commerce/domain/local-ticket.repository";
import type { ActiveTicket } from "@fludge/client/providers/ticket-store.provider";
import { useActiveTicket } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SaleReceiptSheet } from "@/core/commerce/components/sale-receipt/sheet";
import type { ReceiptData, ReceiptItem } from "@/core/commerce/components/sale-receipt/types";
import { ThemedText } from "@/core/shared/components/themed-text";

interface Props {
  ticket: Ticket & { total: number; customer: CustomerSummary | null };
}

export function ticketToReceipt(
  ticket: ActiveTicket & {
    customer: CustomerSummary | null;
  },
): ReceiptData {
  const items = ticket.items.flatMap((product): ReceiptItem[] =>
    product.presentations
      .filter((presentation) => presentation.quantity > 0)
      .map((presentation) => ({
        id: `${product.id}-${presentation.id}`,
        name: product.name,
        quantity: presentation.quantity,
        unitPrice: presentation.priceSale,
        subtotal: presentation.priceSale * presentation.quantity,
        productSnapshot:
          product.type === "catalog"
            ? {
                product: { name: product.name },
                presentation: { name: presentation.name },
              }
            : null,
      })),
  );

  return {
    id: ticket.id,
    name: ticket.name,
    total: ticket.total,
    customer: ticket.customer,
    items,
  };
}

export function ChargeSummarySection({ ticket }: Props) {
  const { t } = useTranslation();
  const activeTicket = useActiveTicket();

  if (!activeTicket) return null;

  return (
    <View style={styles.container}>
      <View>
        <ThemedText>{t("screens.pos.ticket_summary.total")}</ThemedText>
        <ThemedText variant="h2">{formatCurrency(ticket.total)}</ThemedText>
      </View>
      <View>
        <SaleReceiptSheet buttonVarian="onlyIcon" receipt={ticketToReceipt(ticket)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
});
