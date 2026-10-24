import type { ProductDetail } from "@fludge/client/catalog/domain/entities";
import { formatCurrency } from "@fludge/utils/format-currency";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

export const SALES_CARD_HEIGHT = 180;

export function getSalesProductPrice(
  presentations: readonly { priceSale: number }[],
  noPriceLabel: string,
) {
  if (presentations.length === 0) return noPriceLabel;

  const prices = presentations.map((presentation) => presentation.priceSale);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return formatCurrency(min);

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

interface Props {
  product: ProductDetail;
  onPress?: (product: ProductDetail) => void;
  style?: ViewStyle;
}

export function SaleProductCard({ product, onPress, style }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const price = useMemo(
    () => getSalesProductPrice(product.presentations, "Sin precio"),
    [product.presentations],
  );

  const handlePress = useCallback(() => onPress?.(product), [onPress, product]);

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          height: SALES_CARD_HEIGHT,
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: 24,
          padding: 16,
          justifyContent: "space-between",
          gap: 12,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        header: {
          flexDirection: "row",
          alignItems: "flex-start",
        },
        headerContent: {
          flex: 1,
          gap: 8,
        },
        name: {
          fontFamily: GeistFonts.Medium,
          fontSize: 16,
          lineHeight: 24,
          color: colors.onSurface,
        },
        chip: {
          alignSelf: "flex-start",
          backgroundColor: colors.surfaceContainer,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        },
        chipText: {
          fontFamily: GeistFonts.Regular,
          fontSize: 12,
          lineHeight: 16,
          color: colors.onSurfaceVariant,
        },
        price: {
          fontFamily: GeistFonts.SemiBold,
          fontSize: 16,
          lineHeight: 24,
          color: colors.onSurface,
        },
        addIcon: {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: colors.outline,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
        },
        addIconText: {
          fontFamily: GeistFonts.Medium,
          fontSize: 16,
          lineHeight: 20,
          color: colors.outline,
          marginTop: -1,
        },
        pressed: {
          opacity: 0.85,
        },
      }),
    [colors],
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [themedStyles.card, style, pressed && themedStyles.pressed]}
    >
      <View style={themedStyles.header}>
        <View style={themedStyles.headerContent}>
          <ThemedText style={themedStyles.name} numberOfLines={1}>
            {product.name}
          </ThemedText>
          <View style={themedStyles.chip}>
            <ThemedText style={themedStyles.chipText}>
              {t("screens.catalog.products.stock", {
                quantity: product.stock,
              })}
            </ThemedText>
          </View>
        </View>
        <View style={themedStyles.addIcon}>
          <ThemedText style={themedStyles.addIconText}>+</ThemedText>
        </View>
      </View>
      <View>
        <ThemedText style={themedStyles.price}>{price}</ThemedText>
      </View>
    </Pressable>
  );
}
