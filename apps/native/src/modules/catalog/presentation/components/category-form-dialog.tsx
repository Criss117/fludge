import { MaterialIcons } from "@/modules/shared/components/icons";
import { useCategoryForm } from "@fludge/client/application/catalog/form/category-form";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { CategoryFormInputs } from "./category-form-input";
import { useCreateCategoryMutation } from "@fludge/client/application/catalog/mutations/use-category.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { TranslationKey } from "@fludge/i18n/index";

export function CategoryFormDialog() {
  const [open, isOpen] = useState(false);
  const mutationToast = useMutationToast("category-form-toast");
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const { t } = useTranslation();
  const createCategory = useCreateCategoryMutation();

  const form = useCategoryForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showIsPendingToast(
        "mutations.categories.create.is_pending"
      );

      createCategory.mutate(value, {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.categories.create.success.title",
            "mutations.categories.create.success.description"
          );
          isOpen(false);
          resetForm();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.categories.create.error",
            error.message as TranslationKey
          );
        },
      });
    },
  });

  return (
    <BottomSheet isOpen={open} onOpenChange={isOpen}>
      <BottomSheet.Trigger asChild>
        <Button isIconOnly size="lg">
          <MaterialIcons name="add" size={26} className="text-muted" />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={snapPoints}
          enableOverDrag={false}
          enableDynamicSizing={false}
          keyboardBehavior="extend"
          contentContainerClassName="h-full bg-background"
        >
          <BottomSheet.Close />
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pt-3"
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 gap-y-4">
              <form.Field
                name="name"
                children={(field) => (
                  <CategoryFormInputs.NameInput field={field} />
                )}
              />

              <form.Field
                name="description"
                children={(field) => (
                  <CategoryFormInputs.DescriptionInput field={field} />
                )}
              />
              <Button
                onPress={form.handleSubmit}
                isDisabled={createCategory.isPending}
              >
                <Button.Label>{t("forms.category.create")}</Button.Label>
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
