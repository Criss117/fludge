import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import { useTickets } from "@fludge/client/providers/tickets.provider";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";
import { formatPrice } from "@fludge/utils/currency";
import { Dialog } from "heroui-native/dialog";
import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  buildCatalogTicketItem,
  filterProductPresentations,
} from "./product-presentations-dialog.utils";

interface Props {
  product: ProductSummary | null;
  onClose: () => void;
  filterInactive?: boolean;
}

export function ProductPresentationsDialog({
  product,
  onClose,
  filterInactive = false,
}: Props) {
  const { t } = useTranslation();
  const { dispatch, selectedTicketId } = useTickets();
  const mutationToast = useMutationToast("product-presentation-dialog-toast");
  const presentations = product
    ? filterProductPresentations(product.presentations, filterInactive)
    : [];

  function onSelectPresentation(
    presentation: ProductSummary["presentations"][number]
  ) {
    if (!product) return;

    try {
      dispatch({
        type: "add-item",
        payload: {
          ticketId: selectedTicketId,
          item: buildCatalogTicketItem(product, presentation),
        },
      });
      onClose();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          getI18nKey("api_errors.catalog.products.insufficient_stock")
      ) {
        mutationToast.showErrorToast(
          "screens.sales.product.presentations.errors.insufficient_stock_label",
          "screens.sales.product.presentations.errors.try_again"
        );
      }
    }
  }

  return (
    <Dialog
      isOpen={product !== null}
      onOpenChange={(isOpen) => isOpen === false && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          <View>
            <Dialog.Title>
              {t("screens.sales.product.presentations.title")}
            </Dialog.Title>
            <Dialog.Description>
              {t("screens.sales.product.presentations.description", {
                product: product?.name,
              })}
            </Dialog.Description>
          </View>

          <View className="h-75">
            <ScrollView>
              {presentations.length > 0 ? (
                presentations.map((presentation) => (
                  <Button
                    key={presentation.id}
                    variant="ghost"
                    className="flex-row justify-between"
                    onPress={() => onSelectPresentation(presentation)}
                  >
                    <Button.Label>{presentation.name}</Button.Label>
                    <Button.Label>
                      {formatPrice(presentation.priceSale)}
                    </Button.Label>
                  </Button>
                ))
              ) : (
                <Dialog.Description>
                  {t("screens.sales.product.presentations.empty")}
                </Dialog.Description>
              )}
            </ScrollView>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
