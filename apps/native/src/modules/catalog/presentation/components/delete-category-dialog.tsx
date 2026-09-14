import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { CategorySummary } from "@fludge/client/application/catalog/domain/category.repository";
import { useDeleteCategoryMutation } from "@fludge/client/application/catalog/mutations/use-category.mutations";
import { TranslationKey } from "@fludge/i18n/index";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  category: CategorySummary | null;
  onClose: () => void;
}

export function DeleteCategoryDialog({ category, onClose }: Props) {
  const { t } = useTranslation();
  const deleteCategory = useDeleteCategoryMutation();
  const mutationToast = useMutationToast("delete-category-toast");

  const onRemoveCategory = () => {
    if (deleteCategory.isPending || !category) return;

    mutationToast.showIsPendingToast("mutations.categories.delete.is_pending");

    deleteCategory.mutate(
      {
        id: category.id,
      },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.categories.delete.success.title",
            "mutations.categories.delete.success.description"
          );
          onClose();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.categories.delete.error",
            error.message as TranslationKey
          );
        },
      }
    );
  };

  return (
    <Dialog
      isOpen={category !== null}
      onOpenChange={(v) => v === false && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50" />
        <Dialog.Content>
          <Dialog.Close className="absolute top-3 right-3 z-50" />
          <View>
            <Dialog.Title>
              {t("mutations.categories.delete.dialog.title")}
            </Dialog.Title>
            <Dialog.Description>
              {t("mutations.categories.delete.dialog.description", {
                name: category?.name,
              })}
            </Dialog.Description>
          </View>

          <View className="mt-4 flex-row gap-x-2">
            <Button
              className="flex-1"
              variant="outline"
              onPress={onClose}
              isDisabled={deleteCategory.isPending}
            >
              {t("helpers.cancel")}
            </Button>
            <Button
              className="flex-1"
              isDisabled={deleteCategory.isPending}
              variant="danger-soft"
              onPress={onRemoveCategory}
            >
              {t("helpers.continue")}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
