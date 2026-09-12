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

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}

export function SalesSummaryContent({ isOpen, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { activeTicket, dispatch } = useTickets();
  const items = Object.values(activeTicket.items);
  const snapPoints = ["90%"];

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

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={snapPoints}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full px-3"
          footerComponent={renderFooter}
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
              <View
                key={item.id}
                className="bg-surface flex-row items-center justify-between rounded-xl px-3 py-3"
              >
                <View className="flex-1 gap-y-1">
                  <Typography className="font-semibold">{item.name}</Typography>
                  <Typography color="muted">
                    {item.quantity} × {formatPrice(item.priceSale)}
                  </Typography>
                </View>
                <Typography className="font-semibold">
                  {formatPrice(item.priceSale * item.quantity)}
                </Typography>
              </View>
            ))}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
