import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Separator } from "heroui-native/separator";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Typography } from "heroui-native/text";
import { SalePresentationCard } from "./presentation-card";
import { useTicketItemSelector } from "@fludge/client/presentation/sales/sale-ticket-item-selector.provider";
import { useCallback } from "react";
import { Button } from "heroui-native/button";
import { useTickets } from "@fludge/client/providers/tickets.provider";
import { tryCatch } from "@fludge/utils/trycatch";

const SNAP_POINTS = ["70%"];

export function ProductPresentationSelector() {
  const { dispatch, selectedTicketId } = useTickets();
  const productPresentation = useTicketItemSelector();
  const { t } = useTranslation();

  const presentations =
    productPresentation.selectedProduct?.presentations ?? [];

  const isDisabled = productPresentation.selectedTicketItem === null;

  const handleAddTicketItem = () => {
    const [, error] = tryCatch(() => {
      console.log(productPresentation.selectedTicketItem);
      if (!productPresentation.selectedTicketItem) return;
      dispatch({
        type: "add-item",
        payload: {
          ticketId: selectedTicketId,
          item: productPresentation.selectedTicketItem,
        },
      });
      productPresentation.closeSheet();
    });

    if (error) {
      console.log(error);
    }
  };

  const sheetFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View className="bg-overlay pb-safe-offset-8 flex-row gap-x-2 px-3">
          <Button
            variant="outline"
            onPress={productPresentation.closeSheet}
            className="flex-1"
          >
            {t("helpers.cancel")}
          </Button>
          <Button
            isDisabled={isDisabled}
            className="flex-1"
            onPress={handleAddTicketItem}
          >
            {t("helpers.continue")}
          </Button>
        </View>
      </BottomSheetFooter>
    ),
    [isDisabled, t, productPresentation.closeSheet, handleAddTicketItem]
  );

  return (
    <>
      <BottomSheet isOpen={productPresentation.isSheetOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-black/50" />
          <BottomSheet.Content
            snapPoints={SNAP_POINTS}
            enableOverDrag={false}
            enableDynamicSizing={false}
            contentContainerClassName="h-full px-3"
            onClose={productPresentation.closeSheet}
            footerComponent={sheetFooter}
          >
            <View className="flex-row items-start justify-between gap-4 px-3 pb-3">
              <View className="flex-1">
                <BottomSheet.Title className="line-clamp-2">
                  {productPresentation.selectedProduct?.name}
                </BottomSheet.Title>
                <BottomSheet.Description>
                  {t("screens.sales.product.sections.details.stock", {
                    stock: productPresentation.selectedProduct?.stock ?? 0,
                  })}
                </BottomSheet.Description>
              </View>
              <BottomSheet.Close onPress={productPresentation.closeSheet} />
            </View>

            <Separator className="pb-safe-offset -mx-5" />

            <BottomSheetScrollView
              contentContainerClassName="gap-y-3 pb-safe-offset-32 pt-3"
              showsVerticalScrollIndicator={false}
            >
              {presentations.length === 0 && (
                <Typography color="muted" className="py-8 text-center">
                  {t("screens.sales.summary.empty")}
                </Typography>
              )}
              {presentations.map((item) => (
                <SalePresentationCard
                  key={item.id}
                  presentation={item}
                  context={productPresentation}
                />
              ))}
            </BottomSheetScrollView>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </>
  );
}
