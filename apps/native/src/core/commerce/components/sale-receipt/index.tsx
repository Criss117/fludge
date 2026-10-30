import type { SaleSummary } from "@fludge/client/commerce/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, View } from "react-native";

import { SPACING } from "@/lib/sp";

// A thermal receipt is a physical object: it keeps its paper look in dark mode.
const PAPER = "#FBF5E9";
const INK = "#1C1B17";
const INK_FADED = "#6E6759";

const MONO_FONT = Platform.select({ ios: "Menlo", default: "monospace" });

const ZIGZAG_TOOTH_WIDTH = 10;
const ZIGZAG_TOOTH_HEIGHT = 6;

export interface SaleReceiptProps {
  sale: SaleSummary;
}

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function createRng(seed: number) {
  let state = seed || 1;

  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;

    return state / 0x7fffffff;
  };
}

function DashedSeparator() {
  return (
    <Text numberOfLines={1} ellipsizeMode="clip" style={styles.dashedSeparator}>
      {"-".repeat(64)}
    </Text>
  );
}

function ZigzagEdge({ color }: { color: string }) {
  const [width, setWidth] = useState(0);
  const teeth = Math.max(1, Math.ceil(width / ZIGZAG_TOOTH_WIDTH));

  return (
    <View style={styles.zigzagRow} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {Array.from({ length: teeth }, (_, index) => (
        <View key={index} style={[styles.zigzagTooth, { borderTopColor: color }]} />
      ))}
    </View>
  );
}

function FakeBarcode({ value }: { value: string }) {
  const rng = createRng(hashString(value));
  const bars = Array.from({ length: 40 }, () => ({
    width: 1 + Math.floor(rng() * 3),
    gap: 1 + Math.floor(rng() * 2),
  }));

  return (
    <View style={styles.barcodeRow}>
      {bars.map((bar, index) => (
        <View key={index} style={[styles.barcodeBar, { width: bar.width, marginRight: bar.gap }]} />
      ))}
    </View>
  );
}

export function SaleReceipt({ sale }: SaleReceiptProps) {
  const { t } = useTranslation();

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

  const statusLabel = statusLabels[sale.status] ?? sale.status;
  const paymentLabel = paymentTypeLabels[sale.paymentType] ?? sale.paymentType;
  const isCancelled = sale.status === "cancelled";

  const customer = sale.customer;

  return (
    <View style={styles.wrapper}>
      <View style={styles.paper}>
        <Text style={styles.ticketTitle}>{t("screens.sales.list.ticket.title").toUpperCase()}</Text>
        <Text style={styles.centerLine}>#{sale.saleNumber}</Text>
        <Text style={styles.centerLine}>{sale.createdAt.toLocaleString()}</Text>

        <DashedSeparator />

        <Text style={styles.line}>
          {t("screens.sales.list.ticket.customer").toUpperCase()}:{" "}
          {customer?.name ?? t("screens.sales.list.walk_in")}
        </Text>
        {customer && (
          <Text style={styles.line}>
            {customer.documentType} {customer.documentNumber}
          </Text>
        )}

        <DashedSeparator />

        {sale.items.map((item) => (
          <View key={item.id} style={styles.item}>
            {item.productSnapshot === null ? (
              <Text style={styles.line} numberOfLines={1}>
                {item.name}
              </Text>
            ) : (
              <>
                <Text style={styles.line} numberOfLines={1}>
                  {item.productSnapshot?.product.name}
                </Text>
                <Text style={styles.mutedLine} numberOfLines={1}>
                  {"-"} {item.productSnapshot?.presentation.name}
                </Text>
              </>
            )}
            <View style={styles.itemAmountRow}>
              <Text style={styles.mutedLine}>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.line}>{formatCurrency(item.subtotal)}</Text>
            </View>
          </View>
        ))}

        <DashedSeparator />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {t("screens.sales.list.ticket.total").toUpperCase()}
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(sale.total)}</Text>
        </View>

        <Text style={styles.line}>
          {t("screens.sales.list.ticket.payment").toUpperCase()}: {paymentLabel.toUpperCase()}
        </Text>
        <Text style={styles.line}>
          {t("screens.sales.list.ticket.status").toUpperCase()}: {statusLabel.toUpperCase()}
        </Text>

        {isCancelled && (
          <>
            <Text style={styles.cancelledStamp}>*** {statusLabel.toUpperCase()} ***</Text>
            {sale.cancelReason && (
              <Text style={styles.centerLine}>
                {t("screens.sales.list.cancellation_reason").toUpperCase()}: {sale.cancelReason}
              </Text>
            )}
          </>
        )}

        <FakeBarcode value={sale.saleNumber} />
        <Text style={styles.barcodeNumber}>#{sale.saleNumber}</Text>
      </View>

      <ZigzagEdge color={PAPER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  paper: {
    backgroundColor: PAPER,
    borderTopLeftRadius: SPACING.xs,
    borderTopRightRadius: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  ticketTitle: {
    fontFamily: MONO_FONT,
    fontWeight: "700",
    fontSize: 15,
    color: INK,
    textAlign: "center",
    letterSpacing: 1,
  },
  centerLine: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: INK_FADED,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  dashedSeparator: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: INK_FADED,
    marginVertical: SPACING.sm,
  },
  line: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    color: INK,
  },
  mutedLine: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: INK_FADED,
  },
  item: {
    marginBottom: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  itemAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontFamily: MONO_FONT,
    fontWeight: "700",
    fontSize: 16,
    color: INK,
  },
  totalAmount: {
    fontFamily: MONO_FONT,
    fontWeight: "700",
    fontSize: 18,
    color: INK,
  },
  cancelledStamp: {
    fontFamily: MONO_FONT,
    fontWeight: "700",
    fontSize: 15,
    color: INK,
    textAlign: "center",
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
  barcodeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    marginTop: SPACING.md,
  },
  barcodeBar: {
    height: "100%",
    backgroundColor: INK,
  },
  barcodeNumber: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: INK_FADED,
    textAlign: "center",
    marginTop: SPACING.xs,
    letterSpacing: 2,
  },
  zigzagRow: {
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: -1,
  },
  zigzagTooth: {
    width: 0,
    height: 0,
    borderLeftWidth: ZIGZAG_TOOTH_WIDTH / 2,
    borderRightWidth: ZIGZAG_TOOTH_WIDTH / 2,
    borderTopWidth: ZIGZAG_TOOTH_HEIGHT,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});
