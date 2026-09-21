import type { SaleDetail } from "@fludge/client/application/sales/domain/sale.repository";
import { formatPrice } from "@fludge/utils/currency";
import { Dialog } from "heroui-native/dialog";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Estilo tirilla (recibo de impresión), basado en ChargeSaleSummarySection.
const RECEIPT_FONT_SIZE = 13;

interface Props {
  sale: SaleDetail | null;
  onClose: () => void;
}

export function SaleReceiptDialog({ sale, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      isOpen={sale !== null}
      onOpenChange={(v) => v === false && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content style={{ height: "85%" }}>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          {sale !== null ? (
            <View className="flex-1">
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-y-3 pb-2"
              >
                {/* Encabezado tirilla */}
                <View className="items-center gap-y-1">
                  <Typography className="font-semibold">
                    {t("screens.sales.receipt.title")}
                  </Typography>
                  <Typography
                    color="muted"
                    style={{ fontSize: RECEIPT_FONT_SIZE }}
                  >
                    {sale.saleNumber}
                  </Typography>
                  <Typography
                    color="muted"
                    style={{ fontSize: RECEIPT_FONT_SIZE }}
                  >
                    {sale.createdAt.toLocaleString()}
                  </Typography>
                </View>

                <Separator className="-mx-6" />

                <View className="gap-y-1">
                  <View className="flex-row items-center justify-between gap-x-2">
                    <Typography
                      color="muted"
                      style={{ fontSize: RECEIPT_FONT_SIZE }}
                    >
                      {t("screens.sales.payment_type.title")}
                    </Typography>
                    <Typography style={{ fontSize: RECEIPT_FONT_SIZE }}>
                      {t(`screens.sales.payment_type.${sale.paymentType}`)}
                    </Typography>
                  </View>
                  <View className="flex-row items-center justify-between gap-x-2">
                    <Typography
                      color="muted"
                      style={{ fontSize: RECEIPT_FONT_SIZE }}
                    >
                      {t("screens.sales.card.customer")}
                    </Typography>
                    <Typography
                      className="flex-1 text-right"
                      numberOfLines={1}
                      style={{ fontSize: RECEIPT_FONT_SIZE }}
                    >
                      {sale.customerId ?? t("screens.sales.card.walk_in")}
                    </Typography>
                  </View>
                </View>

                {/* Items */}
                <View className="gap-y-2">
                  {sale.items.map((item) => (
                    <View
                      key={item.id}
                      className="border-muted border-b-[0.5px] border-dashed py-2"
                    >
                      <View className="flex-row items-start justify-between gap-x-2">
                        {item.productSnapshot === null ? (
                          <Typography
                            className="flex-1 font-semibold"
                            style={{ fontSize: RECEIPT_FONT_SIZE }}
                          >
                            {item.name}
                          </Typography>
                        ) : (
                          <View>
                            <Typography
                              className="line-clamp-1 flex-1 font-semibold"
                              style={{ fontSize: RECEIPT_FONT_SIZE }}
                            >
                              {item.productSnapshot.product.name}
                            </Typography>
                            <Typography
                              className="text-muted line-clamp-1 flex-1 text-sm"
                              style={{ fontSize: RECEIPT_FONT_SIZE }}
                            >
                              {item.productSnapshot.presentation.name}
                            </Typography>
                          </View>
                        )}

                        <Typography
                          className="font-semibold"
                          style={{ fontSize: RECEIPT_FONT_SIZE }}
                        >
                          {formatPrice(item.subtotal)}
                        </Typography>
                      </View>
                      <Typography
                        color="muted"
                        style={{ fontSize: RECEIPT_FONT_SIZE - 1 }}
                      >
                        x{item.quantity} × {formatPrice(item.unitPrice)}
                      </Typography>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Footer fijo: total siempre visible */}
              <View className="pt-2">
                <Separator className="-mx-6 border-dashed" />
                <View className="flex-row items-center justify-between pt-3">
                  <Typography type="h5">{t("helpers.total")}</Typography>
                  <Typography type="h3">{formatPrice(sale.total)}</Typography>
                </View>
              </View>
            </View>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
