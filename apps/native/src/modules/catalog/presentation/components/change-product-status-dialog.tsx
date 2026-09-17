import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { ProductDetail } from "@fludge/client/application/catalog/domain/product.repository";
import { useUpdateProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import type { ProductStatusEnum } from "@fludge/utils/enums/db-enums";
import type { TranslationKey } from "@fludge/i18n/index";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  product: ProductDetail | null;
  newStatus: ProductStatusEnum | null;
  onClose: () => void;
}

const statusDialogKeys: Record<
  ProductStatusEnum,
  { title: TranslationKey; description: TranslationKey }
> = {
  active: {
    title: "forms.product.status.activate.title",
    description: "forms.product.status.activate.description",
  },
  inactive: {
    title: "forms.product.status.deactivate.title",
    description: "forms.product.status.deactivate.description",
  },
  discontinued: {
    title: "forms.product.status.discontinue.title",
    description: "forms.product.status.discontinue.description",
  },
};

export function ChangeProductStatusDialog({
  product,
  newStatus,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const updateProduct = useUpdateProductMutation();
  const mutationToast = useMutationToast("change-product-status");

  const isOpen = product !== null && newStatus !== null;
  const dialogKeys = newStatus ? statusDialogKeys[newStatus] : null;

  const onConfirm = () => {
    if (updateProduct.isPending || !product || !newStatus) return;

    mutationToast.showIsPendingToast("mutations.products.update.is_pending");

    updateProduct.mutate(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId ?? "",
        stock: product.stock,
        minStock: product.minStock,
        allowNegativeStock: product.allowNegativeStock,
        status: newStatus,
        presentations: product.presentations.map((p) => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode ?? "",
          conversionFactor: p.conversionFactor,
          priceSale: p.priceSale,
          pricePurchase: p.pricePurchase ?? 0,
          priceWholesale: p.priceWholesale ?? 0,
          status: p.status,
        })),
      },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.products.update.success.title",
            "mutations.products.update.success.description"
          );
          onClose();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.products.update.error",
            error.message as TranslationKey
          );
        },
      }
    );
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(v) => v === false && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          <View>
            <Dialog.Title>
              {dialogKeys ? t(dialogKeys.title) : ""}
            </Dialog.Title>
            <Dialog.Description>
              {dialogKeys
                ? t(dialogKeys.description, { name: product?.name })
                : ""}
            </Dialog.Description>
          </View>

          <View className="mt-4 flex-row gap-x-2">
            <Button
              className="flex-1"
              variant="outline"
              onPress={onClose}
              isDisabled={updateProduct.isPending}
            >
              {t("helpers.cancel")}
            </Button>
            <Button
              className="flex-1"
              isDisabled={updateProduct.isPending}
              variant={newStatus === "discontinued" ? "danger-soft" : "primary"}
              onPress={onConfirm}
            >
              {t("helpers.continue")}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
