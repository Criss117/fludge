import { MaterialIcons } from "@/modules/shared/components/icons";
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
import { TicketProductItem } from "./ticket-item";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { KeyboardController } from "react-native-keyboard-controller";
import { Link } from "expo-router";
import { useTicketStore } from "@fludge/client/application/sales/store/use-ticket.store";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}
const SNAP_POINTS = ["90%"];

export function SalesSummaryContent({ isOpen, onOpenChange }: Props) {
  const { t } = useTranslation();
  const ticketStore = useTicketStore();

  const renderFooter = (props: BottomSheetFooterProps) => (
    <BottomSheetFooter {...props}>
      <View className="bg-overlay pb-safe-offset-8 px-4">
        <Separator className="-mx-4 mb-3" />
        <View className="mb-3 flex-row items-center justify-between">
          <Typography>{t("screens.sales.summary.total")}</Typography>
          <Typography className="font-bold">
            {formatPrice(ticketStore.activeTicket.total)}
          </Typography>
        </View>
        <View className="flex-row gap-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => ticketStore.createTicket.mutate()}
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
          <Link
            href={{
              pathname: "/sales/charge",
            }}
            asChild
            push
            disabled={!ticketStore.activeTicket.products.length}
          >
            <Button
              className="flex-1"
              onPress={() => onOpenChange(false)}
              isDisabled={!ticketStore.activeTicket.products.length}
            >
              <MaterialIcons
                name="payments"
                size={20}
                className="text-eclipse"
              />
              <Button.Label className="text-eclipse">
                {t("screens.sales.summary.charge")}
              </Button.Label>
            </Button>
          </Link>
        </View>
      </View>
    </BottomSheetFooter>
  );

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
            {ticketStore.activeTicket.products.length === 0 && (
              <Typography color="muted" className="py-8 text-center">
                {t("screens.sales.summary.empty")}
              </Typography>
            )}

            {ticketStore.activeTicket.products.map((item) => (
              <TicketProductItem
                key={item.id}
                item={item}
                ticketStore={ticketStore}
              />
            ))}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
