import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Separator } from "heroui-native/separator";
import { Card } from "heroui-native/card";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useBottomSheetAwareHandlers } from "heroui-native";
import { Typography } from "heroui-native/text";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Input } from "heroui-native/input";
import { useTicketItemSelector } from "@fludge/client/presentation/sales/sale-ticket-item-selector.provider";

interface Props {
  context: ReturnType<typeof useTicketItemSelector>;
}

export function ProductPresentationSelectorFooter({ context }: Props) {
  const { t } = useTranslation();
  const { onFocus } = useBottomSheetAwareHandlers();
  const {
    selectedTicketItem,
    changePrice,
    resetPrice,
    changeQuantity,
    decreaseQuantity,
    increaseQuantity,
  } = context;

  const isDisabled = !selectedTicketItem;
  const totalQuantity =
    (selectedTicketItem?.quantity ?? 0) *
    (selectedTicketItem?.presentation.conversionFactor ?? 0);
  const subtotal =
    (selectedTicketItem?.presentation.price ?? 0) *
    (selectedTicketItem?.quantity ?? 0);

  const canDecreaseQuantity = (selectedTicketItem?.quantity ?? 0) > 1;

  return (
    <View className="gap-y-2">
      <Card>
        <Card.Body className="relative">
          <CommonInputs.NumberInput
            label="screens.sales.product.presentations.modify_price"
            icon="attach-money"
            isInvalid={false}

            inputProps={{
              value: selectedTicketItem?.presentation.price ?? 0,
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
            <MaterialIcons name="refresh" size={18} className="text-primary" />
          </Button>
        </Card.Body>
        <Card.Footer className="flex-row flex-wrap">
          <Typography className="text-muted text-sm">
            {t("screens.sales.product.presentations.base_price", {
              price: selectedTicketItem
                ? formatCurrency(selectedTicketItem.presentation.originalPrice)
                : 0,
            })}
          </Typography>
          {!!selectedTicketItem?.presentation.priceWholesale && (
            <Typography className="text-muted text-sm">
              {t("screens.sales.product.presentations.wholesale_price", {
                price: selectedTicketItem
                  ? formatCurrency(
                      selectedTicketItem?.presentation.priceWholesale
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
              {selectedTicketItem?.quantity} = {totalQuantity} unds
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
                  value={(selectedTicketItem?.quantity ?? 0).toString()}
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
  );
}
