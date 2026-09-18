import { CommonInputs } from "@/modules/shared/components/common-inputs";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type {
  TicketProduct,
  TicketProductPresentation,
} from "@fludge/client/application/sales/domain/repositories/local-ticket.repository";
import type { useTicketStore } from "@fludge/client/application/sales/store/use-ticket.store";
import { formatPrice } from "@fludge/utils/currency";
import { useBottomSheetAwareHandlers } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Dialog, useDialog } from "heroui-native/dialog";
import { Input } from "heroui-native/input";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";

interface Props {
  item: TicketProduct;
  ticketStore: ReturnType<typeof useTicketStore>;
}

interface PresentationItemProps {
  presentation: TicketProductPresentation;
  ticketProductId: string;
  ticketStore: ReturnType<typeof useTicketStore>;
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
              {t("resources.presentations.price_sale")}
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

function PresentationItem({
  presentation,
  ticketProductId,
  ticketStore,
}: PresentationItemProps) {
  const { onFocus } = useBottomSheetAwareHandlers();
  const { updateTicketProductPresentation, removeTicketProductPresentations } =
    ticketStore;

  const canDecreaseQuantity = presentation.quantity > 1;

  const handleUpdateQuantity = (quantity: number) => {
    updateTicketProductPresentation.mutate({
      ticketProductId,
      ticketProductPresentationId: presentation.id,
      quantity,
      priceSale: presentation.priceSale,
    });
  };

  const handleUpdatePrice = (priceSale: number) => {
    updateTicketProductPresentation.mutate({
      ticketProductId,
      ticketProductPresentationId: presentation.id,
      quantity: presentation.quantity,
      priceSale,
    });
  };

  const handleRemove = () => {
    removeTicketProductPresentations.mutate([presentation.id]);
  };

  return (
    <View className="gap-y-2 py-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-y-0.5">
          <Typography className="line-clamp-1 font-medium">
            {presentation.name}
          </Typography>
          <UpdatePriceDialog
            currentPrice={presentation.priceSale}
            originalPrice={presentation.originalPrice}
            priceWholesale={presentation.wholesalePrice}
            onSubmit={handleUpdatePrice}
          />
        </View>
        <Typography className="font-semibold">
          {formatPrice(presentation.priceSale * presentation.quantity)}
        </Typography>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="border-accent flex-row items-center rounded-3xl border">
          <Button
            className="px-3 py-2"
            isDisabled={!canDecreaseQuantity}
            onPress={() => handleUpdateQuantity(presentation.quantity - 1)}
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
            className="w-16 bg-transparent px-3 text-center"
            value={presentation.quantity.toString()}
            onChangeText={(value) => handleUpdateQuantity(Number(value) || 1)}
            keyboardType="numeric"
            placeholder="0"
            onFocus={onFocus}
          />
          <Button
            className="px-3 py-2"
            onPress={() => handleUpdateQuantity(presentation.quantity + 1)}
            isIconOnly
            size="sm"
            variant="ghost"
          >
            <MaterialIcons name="add" size={18} className="text-foreground" />
          </Button>
        </View>

        <PressableFeedback onPress={handleRemove}>
          <MaterialIcons
            name="delete-outline"
            size={20}
            className="text-danger"
          />
        </PressableFeedback>
      </View>
    </View>
  );
}

export function TicketProductItem({ item, ticketStore }: Props) {
  const totalPrice = useMemo(
    () =>
      item.presentations.reduce((sum, p) => sum + p.priceSale * p.quantity, 0),
    [item.presentations]
  );

  const totalQuantity = useMemo(
    () => item.presentations.reduce((sum, p) => sum + p.quantity, 0),
    [item.presentations]
  );

  const handleRemoveProduct = () => {
    ticketStore.removeTicketProduct.mutate(item.id);
  };

  return (
    <Card className="mx-3">
      <Card.Header className="flex-row justify-between">
        <View className="flex-1 gap-y-1">
          <Card.Title className="line-clamp-2 font-semibold">
            {item.name}
          </Card.Title>
          <Card.Description className="text-muted">
            {totalQuantity} {totalQuantity === 1 ? "unidad" : "unidades"}
          </Card.Description>
        </View>
        <Typography className="font-bold">{formatPrice(totalPrice)}</Typography>
      </Card.Header>

      <Card.Body className="gap-y-0">
        <Separator />
        {item.presentations.map((presentation) => (
          <PresentationItem
            key={presentation.id}
            presentation={presentation}
            ticketProductId={item.id}
            ticketStore={ticketStore}
          />
        ))}
      </Card.Body>

      <Card.Footer>
        <PressableFeedback
          onPress={handleRemoveProduct}
          className="flex-row items-center gap-x-2"
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            className="text-danger"
          />
          <Typography className="text-danger">Eliminar producto</Typography>
        </PressableFeedback>
      </Card.Footer>
    </Card>
  );
}
