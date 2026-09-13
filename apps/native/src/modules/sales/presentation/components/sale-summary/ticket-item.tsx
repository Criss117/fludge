import { CommonInputs } from "@/modules/shared/components/common-input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type {
  TicketItem,
  TicketItemUpdate,
} from "@fludge/client/application/sales/store/tickets.store/data";
import { formatPrice } from "@fludge/utils/currency";
import { useBottomSheetAwareHandlers } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Dialog, useDialog } from "heroui-native/dialog";
import { Input } from "heroui-native/input";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";

interface Props {
  item: TicketItem;
  onRemove: (itemId: string) => void;
  handleUpdateItem: (itemId: string, updates: TicketItemUpdate) => void;
}

interface UpdatePriceDialogProps {
  currentPrice: number;
  originalPrice: number;
  priceWholesale: number | null;
  onSubmit: (price: number) => void;
}

function DialogFooter({
  price,
  onSubmit,
}: {
  price: number;
  onSubmit: (price: number) => void;
}) {
  const { t } = useTranslation();
  const { onOpenChange } = useDialog();

  const onSubmitPrice = () => {
    onSubmit(price);
    onOpenChange(false);
  };

  return (
    <View className="mt-4 flex-row gap-x-2">
      <Button
        className="flex-1"
        variant="outline"
        onPress={() => onOpenChange(false)}
      >
        {t("helpers.cancel")}
      </Button>
      <Button
        className="flex-1"
        onPress={onSubmitPrice}
        isDisabled={price === 0}
      >
        {t("helpers.save")}
      </Button>
    </View>
  );
}

function UpdatePriceDialog({
  onSubmit,
  originalPrice,
  currentPrice,
}: UpdatePriceDialogProps) {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>(currentPrice);

  const resetPrice = () => {
    setPrice(originalPrice);
  };

  const onOpenChange = (v: boolean) => {
    if (v) return;
    console.log("onOpenChange");
    setPrice(currentPrice);
    KeyboardController.dismiss();
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <PressableFeedback className="flex-row items-center">
          <Typography className="font-semibold">
            {formatPrice(currentPrice)}
          </Typography>
          <MaterialIcons name="edit" size={18} className="text-foreground" />
        </PressableFeedback>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          <View>
            <Dialog.Title>
              {t("mutations.categories.delete.dialog.title")}
            </Dialog.Title>
          </View>
          <View className="relative justify-center">
            <CommonInputs.NumberInput
              label="resources.presentations.price_sale"
              isRequired
              isInvalid={price < 0}
              icon="attach-money"
              inputProps={{
                className: "text-right bg-default text-xl pr-12",
                placeholder: "helpers.placeholder.zero",
                onChangeText: setPrice,
                value: price,
              }}
            />
            <Button
              isIconOnly
              className="absolute right-0 bottom-0.5"
              variant="ghost"
              onPress={resetPrice}
            >
              <MaterialIcons name="refresh" size={20} />
            </Button>
          </View>

          <DialogFooter price={price} onSubmit={onSubmit} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export function TicketItem({ item, onRemove, handleUpdateItem }: Props) {
  const { onFocus } = useBottomSheetAwareHandlers();
  const [productName, presentationName] = item.name.split(":");

  const canDecreaseQuantity = item.quantity > 1;

  const increaseQuantity = () => {
    handleUpdateItem(item.id, { quantity: item.quantity + 1 });
  };

  const decreaseQuantity = () => {
    if (!canDecreaseQuantity) return;
    handleUpdateItem(item.id, { quantity: item.quantity - 1 });
  };

  return (
    <Card className="mx-3 flex-row justify-between">
      <Card.Header className="w-3/5 gap-y-1">
        <Card.Title className="line-clamp-2 font-semibold">
          {productName}
        </Card.Title>
        <Card.Description className="text-muted line-clamp-1">
          {presentationName}
        </Card.Description>
        <UpdatePriceDialog
          currentPrice={item.priceSale}
          originalPrice={item.originalPrice}
          priceWholesale={item.wholesalePrice}
          onSubmit={(price) => {
            handleUpdateItem(item.id, { priceSale: price });
          }}
        />
      </Card.Header>
      <Card.Body className="w-2/5 items-end justify-between">
        <View className="w-full items-end">
          <Typography className="font-semibold">
            {formatPrice(item.priceSale * item.quantity)}
          </Typography>

          <View className="border-accent w-full flex-row items-center justify-between rounded-3xl border">
            <Button
              className="px-3 py-2"
              isDisabled={!canDecreaseQuantity}
              onPress={decreaseQuantity}
              isIconOnly
              size="sm"
              variant="ghost"
            >
              <MaterialIcons
                name="remove"
                size={18}
                className="text-foreground"
              />
            </Button>
            <Input
              className="bg-transparent px-3"
              value={item.quantity.toString()}
              onChangeText={(value) => {
                handleUpdateItem(item.id, { quantity: Number(value) });
              }}
              keyboardType="numeric"
              placeholder="0"
              onFocus={onFocus}
            />
            <Button
              className="px-3 py-2"
              onPress={increaseQuantity}
              isIconOnly
              size="sm"
              variant="ghost"
            >
              <MaterialIcons name="add" size={18} className="text-foreground" />
            </Button>
          </View>
        </View>
        <PressableFeedback onPress={() => onRemove(item.id)}>
          <MaterialIcons
            name="delete-outline"
            size={20}
            className="text-danger"
          />
        </PressableFeedback>
      </Card.Body>
    </Card>
  );
}
