import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";

import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useState } from "react";
import { Separator } from "heroui-native/separator";
import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { Card } from "heroui-native/card";
import type { NewCatalogTicketItem } from "@fludge/client/application/sales/store/tickets.store";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useBottomSheetAwareHandlers } from "heroui-native";
import { Typography } from "heroui-native/text";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Input } from "heroui-native/input";

type Presentation = ProductSummary["presentations"][number];

interface Props {
  bottomSheetFooterProps: BottomSheetFooterProps;
  selectedPresentation: Presentation | null;
  product: ProductSummary | null;
  onAddItem: (item: NewCatalogTicketItem) => void;
  onCancelSelection: () => void;
}

function generateNewItem(
  product: ProductSummary,
  selectedPresentation: Presentation
) {
  const newItem: NewCatalogTicketItem = {
    kind: "catalog",
    quantity: 1,
    presentation: {
      kind: "catalog",
      id: selectedPresentation.id,
      productId: product.id,
      name: selectedPresentation.name,
      conversionFactor: selectedPresentation.conversionFactor,
      price: selectedPresentation.priceSale,
      priceWholesale: selectedPresentation.priceWholesale,
      originalPrice: selectedPresentation.priceSale,
    },
    product: {
      id: product.id,
      allowNegativeStock: false,
      minStock: 0,
      totalStock: product.stock,
    },
  };

  return newItem;
}

type Values =
  | { quantity: number }
  | { price: number }
  | { quantity: number; price: number };

function updateItem(selectedItem: NewCatalogTicketItem, values: Values) {
  let newQuantity = selectedItem.quantity;
  let newPrice = selectedItem.presentation.price;

  if ("quantity" in values) newQuantity = values.quantity;

  if ("price" in values) newPrice = values.price;

  if (newQuantity <= 0 || newPrice <= 0) return selectedItem;

  const newItem: NewCatalogTicketItem = {
    ...selectedItem,
    quantity: newQuantity,
    presentation: {
      ...selectedItem.presentation,
      price: newPrice,
    },
  };

  return newItem;
}

export function ProductPresentationSelectorFooterComponent({
  bottomSheetFooterProps,
  selectedPresentation,
  product,
  onCancelSelection,
  onAddItem,
}: Props) {
  const { t } = useTranslation();
  const { onFocus } = useBottomSheetAwareHandlers();

  const [selectedItem, setSelectedItem] = useState<NewCatalogTicketItem | null>(
    () => {
      if (!product?.id || !selectedPresentation?.id) return null;

      return generateNewItem(product, selectedPresentation);
    }
  );

  function changeQuantity(newQuantity: number) {
    if (!selectedItem) return;
    setSelectedItem(
      updateItem(selectedItem, {
        quantity: newQuantity,
      })
    );
  }

  function resetPrice() {
    changePrice(selectedItem?.presentation.originalPrice ?? 0);
  }

  function changePrice(newPrice: number) {
    if (!selectedItem) return;

    setSelectedItem(
      updateItem(selectedItem, {
        price: newPrice,
      })
    );
  }

  function decreaseQuantity() {
    if (!selectedItem) return;

    setSelectedItem(
      updateItem(selectedItem, {
        quantity: selectedItem.quantity - 1,
      })
    );
  }

  function increaseQuantity() {
    if (!selectedItem) return;

    setSelectedItem(
      updateItem(selectedItem, {
        quantity: selectedItem.quantity + 1,
      })
    );
  }

  function handleAddItem() {
    if (!selectedItem) return;

    onAddItem(selectedItem);
  }

  const isDisabled = !selectedItem;

  const subtotal =
    (selectedItem?.presentation.price ?? 0) * (selectedItem?.quantity ?? 0);

  const totalQuantity =
    (selectedItem?.quantity ?? 0) *
    (selectedItem?.presentation.conversionFactor ?? 0);

  const canDecreaseQuantity = (selectedItem?.quantity ?? 0) > 1;

  return (
    <BottomSheetFooter {...bottomSheetFooterProps}>
      <View className="gap-y-2">
        <View className="gap-y-2 px-3">
          <Card>
            <Card.Body className="relative">
              <CommonInputs.NumberInput
                label="screens.sales.product.presentations.modify_price"
                icon="attach-money"
                isInvalid={false}

                inputProps={{
                  value: selectedItem?.presentation.price ?? 0,
                  onChangeText: changePrice,
                  onFocus: onFocus,
                  placeholder: "helpers.placeholder.cero",
                  isDisabled: isDisabled,
                }}
              />
              <Button
                size="sm"
                className="absolute inset-e-1 bottom-1"
                onPress={resetPrice}
                isDisabled={isDisabled}
                isIconOnly
              >
                <MaterialIcons
                  name="refresh"
                  size={18}
                  className="text-primary"
                />
              </Button>
            </Card.Body>
            <Card.Footer className="flex-row flex-wrap">
              <Typography className="text-muted text-sm">
                {t("screens.sales.product.presentations.base_price", {
                  price: selectedItem
                    ? formatCurrency(selectedItem.presentation.originalPrice)
                    : 0,
                })}
              </Typography>
              {!!selectedItem?.presentation.priceWholesale && (
                <Typography className="text-muted text-sm">
                  {t("screens.sales.product.presentations.wholesale_price", {
                    price: selectedItem
                      ? formatCurrency(
                          selectedItem?.presentation.priceWholesale
                        )
                      : 0,
                  })}
                </Typography>
              )}
            </Card.Footer>
          </Card>

          <Card>
            <View className="flex-row justify-between">
              <Card.Header>
                <Card.Title className="text-base">
                  {t("helpers.quantity")}
                </Card.Title>
                <Card.Description className="text-sm">
                  {selectedItem?.quantity} = {totalQuantity} unds
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Card className="bg-surface flex-row items-center gap-x-2">
                  <Button
                    isIconOnly
                    size="sm"
                    onPress={decreaseQuantity}
                    isDisabled={isDisabled || !canDecreaseQuantity}
                  >
                    <MaterialIcons name="remove" size={24} className="" />
                  </Button>
                  <View className="size-12">
                    <Input
                      value={(selectedItem?.quantity ?? 0).toString()}
                      className="flex-1 text-center text-xl"
                      keyboardType="number-pad"
                      onChangeText={(v) => changeQuantity(parseInt(v))}
                      onFocus={onFocus}
                      isDisabled={isDisabled}
                    />
                  </View>
                  <Button
                    isIconOnly
                    size="sm"
                    onPress={increaseQuantity}
                    isDisabled={isDisabled}
                  >
                    <MaterialIcons name="add" size={24} className="" />
                  </Button>
                </Card>
              </Card.Body>
            </View>
            <Card.Footer className="flex-row flex-wrap">
              <Typography>
                {t("helpers.subtotal")}: {formatCurrency(subtotal)}
              </Typography>
            </Card.Footer>
          </Card>
        </View>
        <Separator />

        <View className="bg-overlay pb-safe-offset-8 flex-row gap-x-2 px-3">
          <Button variant="outline" onPress={onCancelSelection}>
            {t("helpers.cancel")}
          </Button>
          <Button
            className="flex-1"
            isDisabled={isDisabled}
            onPress={handleAddItem}
          >
            {t("screens.sales.product.presentations.add_to_ticket")}
          </Button>
        </View>
      </View>
    </BottomSheetFooter>
  );
}
