import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { formatPrice } from "@fludge/utils/currency";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

// react-doctor-disable-next-line only-export-components -- Layout constant is part of this component's public rendering contract.
export const SALES_CARD_HEIGHT = 180;

// react-doctor-disable-next-line only-export-components -- Pure pricing helper is intentionally colocated with its presentation component.
export function getSalesProductPrice(
  presentations: ReadonlyArray<{ priceSale: number }>,
  noPriceLabel: string
) {
  if (presentations.length === 0) return noPriceLabel;

  const prices = presentations.map((presentation) => presentation.priceSale);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return formatPrice(min);

  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

interface Props {
  product: ProductSummary;
  onPress?: (product: ProductSummary) => void;
}

export const SalesProductCard = React.memo(function SalesProductCard({
  product,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const price = useMemo(
    () =>
      getSalesProductPrice(
        product.presentations,
        t("screens.sales.product.no_price")
      ),
    [product.presentations, t]
  );
  const handlePress = useCallback(() => onPress?.(product), [onPress, product]);

  return (
    <PressableFeedback
      className="flex-1 rounded-3xl shadow"
      onPress={handlePress}
    >
      <Card
        className="h-full justify-between gap-y-3"
        style={{ height: SALES_CARD_HEIGHT }}
      >
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-1">{product.name}</Card.Title>
            <Chip size="sm" className="self-start">
              <Chip.Label>
                {t("screens.sales.product.sections.details.stock", {
                  stock: product.stock,
                })}
              </Chip.Label>
            </Chip>
          </View>
          <MaterialIcons
            name="add-circle-outline"
            size={24}
            className="text-muted opacity-50"
          />
        </Card.Header>
        <Card.Body>
          <Typography className="font-semibold">{price}</Typography>
        </Card.Body>
      </Card>
    </PressableFeedback>
  );
});
