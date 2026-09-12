import { useTickets } from "@fludge/client/providers/tickets.provider";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";

import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { useState } from "react";
import { Separator } from "heroui-native/separator";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Typography } from "heroui-native/text";
import { Card } from "heroui-native/card";
import { Checkbox } from "heroui-native/checkbox";
import { formatCurrency } from "@fludge/utils/format-currency";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import type { NewCatalogTicketItem } from "@fludge/client/application/sales/store/tickets.store";
import { ProductPresentationSelectorFooterComponent } from "./footer";

type Presentation = ProductSummary["presentations"][number];

interface Props {
  product: ProductSummary | null;
  setSelectedProduct: (product: ProductSummary | null) => void;
}

const SNAP_POINTS = ["90%"];

export function ProductPresentationSelector({
  product,
  setSelectedProduct,
}: Props) {
  const { dispatch, selectedTicketId } = useTickets();
  const { t } = useTranslation();

  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(() => {
      console.log(product);
      if (!product?.id) return null;

      return product.presentations[0];
    });

  const presentations = product
    ? product.presentations.filter(
        (presentation) => presentation.status === "active"
      )
    : [];

  const isSelected = (item: Presentation) =>
    item.id === selectedPresentation?.id;

  const handleAddItem = (item: NewCatalogTicketItem) => {
    dispatch({
      type: "add-item",
      payload: {
        item,
        ticketId: selectedTicketId,
      },
    });
  };

  const onCancelSelection = () => {
    setSelectedPresentation(null);
    setSelectedProduct(null);
  };

  return (
    <BottomSheet isOpen={product !== null}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/50" />
        <BottomSheet.Content
          snapPoints={SNAP_POINTS}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full px-3"
          onClose={onCancelSelection}
          footerComponent={(props) => (
            <ProductPresentationSelectorFooterComponent
              bottomSheetFooterProps={props}
              product={product}
              selectedPresentation={selectedPresentation}
              onAddItem={handleAddItem}
              onCancelSelection={onCancelSelection}
            />
          )}
        >
          <View className="flex-row items-start justify-between gap-4 px-3 pb-3">
            <View className="flex-1">
              <BottomSheet.Title className="line-clamp-2">
                {product?.name}
              </BottomSheet.Title>
              <BottomSheet.Description>
                {t("screens.sales.product.sections.details.stock", {
                  stock: product?.stock ?? 0,
                })}
              </BottomSheet.Description>
            </View>
            <BottomSheet.Close />
          </View>

          <Separator className="pb-safe-offset -mx-5" />

          <BottomSheetScrollView
            contentContainerClassName="gap-y-3 pb-safe-offset-32 pt-3"
            showsVerticalScrollIndicator={false}
          >
            {presentations.length === 0 ? (
              <Typography color="muted" className="py-8 text-center">
                {t("screens.sales.summary.empty")}
              </Typography>
            ) : (
              presentations.map((item) => (
                <PressableFeedback
                  key={item.id}
                  onPress={() => setSelectedPresentation(item)}
                  className="rounded-3xl shadow"
                >
                  <Card className="flex-row items-center gap-x-1">
                    <Card.Header>
                      <Checkbox
                        isSelected={isSelected(item)}
                        onPress={() => setSelectedPresentation(item)}
                      />
                    </Card.Header>
                    <Card.Body className="flex-1 gap-y-1">
                      <Typography className="line-clamp-1">
                        {item.name}
                      </Typography>
                      <Typography className="text-muted text-sm">
                        {item.barcode}
                      </Typography>
                    </Card.Body>
                    <Card.Footer className="flex-col items-end">
                      <Typography className="font-semibold">
                        {formatCurrency(item.priceSale)}
                      </Typography>
                      <Typography className="text-muted text-sm">
                        x {item.conversionFactor}
                      </Typography>
                    </Card.Footer>
                  </Card>
                </PressableFeedback>
              ))
            )}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
