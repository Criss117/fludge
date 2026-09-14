import { MaterialIcons } from "@/modules/shared/components/icons";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { ProductSummary } from "@fludge/client/application/catalog/domain/product.repository";
import { useDeleteProductMutation } from "@fludge/client/application/catalog/mutations/use-product.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { Link, useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { Popover } from "heroui-native/popover";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";

interface Props {
  product: ProductSummary;
}

const screenWidth = Dimensions.get("screen").width;

export function DeleteProductDialog({
  product,
  closeMenu,
}: Props & {
  closeMenu: () => void;
}) {
  const mutationToast = useMutationToast("mutations.products.delete");
  const router = useRouter();
  const deleteProduct = useDeleteProductMutation();
  const { t } = useTranslation();

  const onPressDelete = () => {
    if (deleteProduct.isPending) return;

    mutationToast.showIsPendingToast("mutations.products.delete.is_pending");

    deleteProduct.mutate(
      {
        id: product.id,
      },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.products.delete.success.title",
            "mutations.products.delete.success.description"
          );
        },
        onError: (err) => {
          mutationToast.showErrorToast(
            "mutations.products.delete.error",
            err.message as TranslationKey
          );
        },
      }
    );
  };

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button size="sm" className="flex justify-start" variant="danger-soft">
          <MaterialIcons name="delete" size={20} className="text-danger" />
          <Button.Label>{t("helpers.delete")}</Button.Label>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          <View>
            <Dialog.Title>{t("helpers.unassign_member")}</Dialog.Title>
            <Dialog.Description>
              {t("mutations.products.delete.ask", {
                name: product.name,
              })}
            </Dialog.Description>
            <Dialog.Description>
              {t("mutations.products.delete.description")}
            </Dialog.Description>
          </View>

          <View className="mt-4 flex-row gap-x-2">
            <Button className="flex-1" variant="outline" onPress={closeMenu}>
              {t("helpers.cancel")}
            </Button>
            <Button
              className="flex-1"
              variant="danger-soft"
              onPress={onPressDelete}
            >
              {t("helpers.continue")}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

export function ProductMenuOptions({ product }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button isIconOnly variant="ghost">
          <MaterialIcons
            name="more-vert"
            size={24}
            className="text-foreground"
          />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay className="bg-black/50" />
        <Popover.Content
          presentation="popover"
          width={screenWidth / 2}
          className="gap-1 rounded-xl px-6 py-4"
        >
          <Popover.Arrow />
          <Popover.Close className="absolute top-3 right-3 z-50" />
          <Popover.Title>{t("helpers.options")}</Popover.Title>
          <Link
            href={{
              pathname: "/dashboard/products/[productid]/update",
              params: { productid: product.id },
            }}
            push
            asChild
          >
            <Button
              size="sm"
              onPress={closeMenu}
              className="flex justify-start"
            >
              <MaterialIcons name="edit" size={20} className="text-eclipse" />
              <Button.Label>{t("helpers.edit")}</Button.Label>
            </Button>
          </Link>

          <DeleteProductDialog product={product} closeMenu={closeMenu} />
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
