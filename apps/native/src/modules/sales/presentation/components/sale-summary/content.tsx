import { MaterialIcons } from "@/modules/shared/components/icons";
import { useTickets } from "@fludge/client/providers/tickets.provider";
import { formatPrice } from "@fludge/utils/currency";
import {
  BottomSheetFooter,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TicketItem } from "./ticket-item";
import { TicketItemUpdate } from "@fludge/client/application/sales/store/tickets.store/data";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { useEffect } from "react";
import type { TranslationKey } from "@fludge/i18n/index";
import { KeyboardController } from "react-native-keyboard-controller";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}
const SNAP_POINTS = ["90%"];

export function SalesSummaryContent({ isOpen, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { activeTicket, dispatch, state } = useTickets();
  const items = Object.values(activeTicket.items);
  const mutationToast = useMutationToast("SALES_SUMMARY");

  const renderFooter = (props: BottomSheetFooterProps) => (
    <BottomSheetFooter {...props}>
      <View className="bg-overlay pb-safe-offset-8 px-4">
        <Separator className="-mx-4 mb-3" />
        <View className="mb-3 flex-row items-center justify-between">
          <Typography>{t("screens.sales.summary.total")}</Typography>
          <Typography className="font-bold">
            {formatPrice(activeTicket.total)}
          </Typography>
        </View>
        <View className="flex-row gap-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() =>
              dispatch({
                type: "createTicket",
              })
            }
          >
            <MaterialIcons
              name="delete-outline"
              size={20}
              className="text-foreground"
            />
            <Button.Label className="text-foreground">
              {t("screens.sales.summary.clear")}
            </Button.Label>
          </Button>
          <Button className="flex-1">
            <MaterialIcons name="payments" size={20} className="text-eclipse" />
            <Button.Label className="text-eclipse">
              {t("screens.sales.summary.charge")}
            </Button.Label>
          </Button>
        </View>
      </View>
    </BottomSheetFooter>
  );

  const handleRemoveItem = (itemId: string) => {
    dispatch({
      type: "deleteTicketItem",
      payload: [itemId],
    });
  };

  const handleUpdateItem = (itemId: string, updates: TicketItemUpdate) => {
    dispatch({
      type: "updateTicketItem",
      payload: [itemId, updates],
    });
  };

  useEffect(() => {
    if (state.lastError) {
      mutationToast.showErrorToast(
        "forms.ticket.err_on_update",
        state.lastError as TranslationKey
      );
    }

    dispatch({
      type: "clearError",
    });
  }, [state.lastError]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={SNAP_POINTS}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full px-0"
          footerComponent={renderFooter}
          onClose={() => KeyboardController.dismiss()}
        >
          <View className="flex-row items-center justify-between gap-4 px-3 pb-3">
            <View className="flex-row items-center gap-x-2">
              <MaterialIcons
                name="shopping-cart"
                size={24}
                className="text-foreground"
              />
              <BottomSheet.Title maxFontSizeMultiplier={1.2} numberOfLines={1}>
                {t("screens.sales.summary.title")}
              </BottomSheet.Title>
            </View>
            <BottomSheet.Close />
          </View>

          <Separator className="pb-safe-offset -mx-5" />
          <BottomSheetScrollView
            contentContainerClassName="gap-y-3 pb-safe-offset-32 pt-3"
            showsVerticalScrollIndicator={false}
          >
            {items.length === 0 && (
              <Typography color="muted" className="py-8 text-center">
                {t("screens.sales.summary.empty")}
              </Typography>
            )}

            {items.map((item) => (
              <TicketItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                handleUpdateItem={handleUpdateItem}
              />
            ))}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
