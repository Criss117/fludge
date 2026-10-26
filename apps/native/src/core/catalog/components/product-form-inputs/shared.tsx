import { Host } from "@expo/ui";
import type { ProductFormSchema } from "@fludge/client/catalog/forms/product.form";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import type { InputProps } from "@/core/shared/components/text-input/types";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

type PresentationCardProps = InputProps<ProductFormSchema["presentations"]> & {
  remove: (id: string) => void;
  restore: (id: string) => void;
  onSelect: (p: ProductFormSchema["presentations"][number] | null) => void;
};

type CardProps = {
  presentation: ProductFormSchema["presentations"][number];
  onSelect: (p: ProductFormSchema["presentations"][number] | null) => void;
  remove: (id: string) => void;
};

function Card({ presentation, onSelect, remove }: CardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.presentationContainer,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.presentationHeader}>
        <View>
          <ThemedText variant="h5">{presentation.name}</ThemedText>
          <ThemedText variant="muted">Factor x {presentation.conversionFactor}</ThemedText>
          <View style={styles.barcodeContainer}>
            <Host matchContents>
              <Icon name="barcode" size={18} color={colors.outline} />
            </Host>
            <ThemedText variant="muted">{presentation.barcode || "-"}</ThemedText>
          </View>
        </View>

        <Host matchContents>
          <MenuOptions
            items={[
              {
                label: "helpers.navigation.update",
                icon: "edit",
                action: () => {
                  onSelect(presentation);
                },
              },
              {
                label: "helpers.navigation.delete",
                icon: "delete",
                action: () => {
                  remove(presentation.id);
                },
                color: "error",
              },
            ]}
          />
        </Host>
      </View>

      <View
        style={[
          {
            backgroundColor: colors.outline,
          },
          styles.divider,
        ]}
      />

      <View style={styles.presentationFooter}>
        <View>
          <ThemedText
            variant="h6"
            style={{
              color: colors.outline,
            }}
          >
            {t("forms.product_presentation.price_sale.label")}
          </ThemedText>
          <ThemedText
            variant="h4"
            style={{
              color: colors.tertiary,
            }}
          >
            {formatCurrency(presentation.priceSale)}
          </ThemedText>
        </View>
        <View style={styles.presentationPrices}>
          <View>
            <ThemedText variant="muted">
              {t("forms.product_presentation.price_purchase.label")}
            </ThemedText>
            <ThemedText variant="h6">
              {presentation.pricePurchase === 0 ? "-" : formatCurrency(presentation.pricePurchase)}
            </ThemedText>
          </View>
          <View>
            <ThemedText variant="muted">
              {t("forms.product_presentation.price_wholesale.label")}
            </ThemedText>
            <ThemedText variant="h6">
              {presentation.priceWholesale === 0
                ? "-"
                : formatCurrency(presentation.priceWholesale)}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

export function PresentationCards({ field, remove, onSelect }: PresentationCardProps) {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          backgroundColor: colors.onSecondary,
        },
        styles.container,
      ]}
    >
      {field.state.value.map((p) => (
        <Card key={p.id} presentation={p} onSelect={onSelect} remove={remove} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: SPACING.xl,
  },
  presentationContainer: {
    padding: SPACING.md,
    borderRadius: SPACING.md,
    rowGap: SPACING.md,
  },
  presentationHeader: { flexDirection: "row", justifyContent: "space-between" },
  barcodeContainer: {
    flexDirection: "row",
    columnGap: SPACING.sm,
  },
  divider: {
    height: 1,
  },
  presentationFooter: {
    rowGap: SPACING.sm,
  },
  presentationPrices: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
