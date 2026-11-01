import { Host } from "@expo/ui";
import type { TicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { DeleteButton, EditPresentation, PresentationQuantity } from "./actions";
import type { TicketDetailItemProps } from "./types";

function TicketDetailItem({ presentation, itemId }: TicketDetailItemProps) {
  const updatePresentation = useTicketStore((s) => s.updatePresentation);
  const removePresentations = useTicketStore((s) => s.removePresentations);

  const handleRemovePresentation = () => {
    removePresentations([presentation.id]);
  };

  const handleUpdateQuantity = (quantity: number) => {
    updatePresentation({
      priceSale: presentation.priceSale,
      quantity,
      ticketItemId: itemId,
      ticketPresentationId: presentation.id,
    });
  };

  const increaseQuantity = () => {
    handleUpdateQuantity(presentation.quantity + 1);
  };

  const decreaseQuantity = () => {
    const nextQuantity = presentation.quantity - 1;

    if (nextQuantity <= 0) {
      handleRemovePresentation();
      return;
    }

    handleUpdateQuantity(nextQuantity);
  };

  return (
    <View style={itemStyles.container}>
      <View style={itemStyles.header}>
        <View>
          <ThemedText numberOfLines={1}>{presentation.name}</ThemedText>
          <EditPresentation presentation={presentation} itemId={itemId} />
        </View>
        <Host matchContents>
          <DeleteButton onPress={handleRemovePresentation} />
        </Host>
      </View>

      <View style={itemStyles.footer}>
        <Host matchContents>
          <PresentationQuantity
            decrease={decreaseQuantity}
            increase={increaseQuantity}
            quantity={presentation.quantity}
          />
        </Host>
        <View>
          <ThemedText variant="h6">
            <ThemedText variant="muted">total </ThemedText>
            {formatCurrency(presentation.priceSale * presentation.quantity)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  container: {
    marginLeft: SPACING.sm,
    rowGap: SPACING.md,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    rowGap: SPACING.sm,
  },
  button: {
    height: SPACING["2xl"],
    width: SPACING["2xl"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  stockLabel: {
    height: SPACING["2xl"],
    width: SPACING["2xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    flexDirection: "row",
  },
});

export function TicketDetail({ item }: { item: TicketProduct }) {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      <ThemedText variant="h5">{item.name}</ThemedText>

      <View style={styles.presentationList}>
        {item.presentations.map((p) => (
          <TicketDetailItem presentation={p} key={p.id} itemId={item.id} />
        ))}
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    rowGap: SPACING.sm,
  },
  presentationList: {
    rowGap: SPACING.sm,
  },

  divider: {
    width: "100%",
    height: 0.5,
  },
});
