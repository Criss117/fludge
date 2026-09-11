import { useTickets } from "@fludge/client/providers/tickets.provider";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";

import { formatPrice } from "@fludge/utils/currency";
import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { filterProductPresentations } from "./product-presentations-dialog.utils";
import { useState } from "react";
import { Separator } from "heroui-native/separator";
import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Typography } from "heroui-native/text";
import { Card } from "heroui-native/card";
import { Checkbox } from "heroui-native/checkbox";
import { formatCurrency } from "@fludge/utils/format-currency";
import { PressableFeedback } from "heroui-native/pressable-feedback";

interface Props {
  product: ProductSummary | null;
  onClose: () => void;
  filterInactive?: boolean;
}

type Presentation = ProductSummary["presentations"][number];

interface FooterProps {
  bottomSheetFooterProps: BottomSheetFooterProps;
  selectedPresentation: Presentation | null;
}

function FooterComponent({
  bottomSheetFooterProps,
  selectedPresentation,
}: FooterProps) {
  return <BottomSheetFooter {...bottomSheetFooterProps}></BottomSheetFooter>;
}

export function ProductPresentationsDialog({
  product,
  onClose,
  filterInactive = false,
}: Props) {
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const { t } = useTranslation();
  const { dispatch, selectedTicketId } = useTickets();
  const snapPoints = ["90%"];
  const presentations = product
    ? filterProductPresentations(product.presentations, filterInactive)
    : [];

  const isSelected = (item: Presentation) =>
    item.id === selectedPresentation?.id;

  return (
    <BottomSheet
      isOpen={product !== null}
      onOpenChange={(isOpen) => isOpen === false && onClose()}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/50" />
        <BottomSheet.Content
          snapPoints={snapPoints}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full px-3"
          onClose={() => {
            setSelectedPresentation(null);
          }}
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
