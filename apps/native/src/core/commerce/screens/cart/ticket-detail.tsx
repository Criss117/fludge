import { Host } from "@expo/ui";
import type { TicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { PressableOpacity } from "pressto";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

function TicketDetailItem({
  presentation,
  itemId,
}: {
  presentation: TicketProduct["presentations"][number];
  itemId: string;
}) {
  const updatePresentation = useTicketStore((s) => s.updatePresentation);
  const removePresentations = useTicketStore((s) => s.removePresentations);

  const colors = useThemeColor();

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
      removePresentations([presentation.id]);
      return;
    }

    handleUpdateQuantity(nextQuantity);
  };

  return (
    <View key={presentation.id} style={itemStyles.container}>
      <View style={itemStyles.header}>
        <ThemedText numberOfLines={1}>{presentation.name}</ThemedText>
        <ThemedText variant="muted">{presentation.priceSale} c/u</ThemedText>
        <ThemedText>
          x{presentation.quantity} {formatCurrency(presentation.priceSale * presentation.quantity)}
        </ThemedText>
      </View>
      <View style={itemStyles.actions}>
        <PressableOpacity
          style={[
            itemStyles.button,
            {
              borderColor: "transparent",
            },
          ]}
        >
          <Host matchContents>
            <Icon name="delete" size={18} color={colors.error} />
          </Host>
        </PressableOpacity>

        <View style={itemStyles.quantity}>
          <PressableOpacity
            style={[
              itemStyles.button,
              {
                borderColor: colors.primary,
              },
            ]}
            onPress={decreaseQuantity}
          >
            <Host matchContents>
              <Icon name="remove" size={18} />
            </Host>
          </PressableOpacity>

          <View style={itemStyles.stockLabel}>
            <ThemedText variant="h5">{presentation.quantity}</ThemedText>
          </View>

          <PressableOpacity
            style={[
              itemStyles.button,
              {
                borderColor: colors.primary,
              },
            ]}
            onPress={increaseQuantity}
          >
            <Host matchContents>
              <Icon name="add" size={18} />
            </Host>
          </PressableOpacity>
        </View>
      </View>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginLeft: SPACING.sm,
  },
  header: {
    flex: 1,
  },
  actions: {},
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
