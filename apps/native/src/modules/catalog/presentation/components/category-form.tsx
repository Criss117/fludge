import { MaterialIcons } from "@/modules/shared/components/icons";
import {
  useCreateCategoryForm,
  useUpdateCategoryForm,
} from "@fludge/client/application/catalog/form/category-form";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { CategoryFormInputs } from "./category-form-input";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@fludge/client/application/catalog/mutations/use-category.mutations";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { TranslationKey } from "@fludge/i18n/index";
import { KeyboardController } from "react-native-keyboard-controller";
import type { CategorySummary } from "@fludge/client/application/catalog/queries/use-find-categories";

interface UpdateCategoryFormProps {
  category: CategorySummary | null;
  onClose: () => void;
}

interface FormProps {
  form:
    | ReturnType<typeof useCreateCategoryForm>
    | ReturnType<typeof useUpdateCategoryForm>;
  isPending: boolean;
  label: TranslationKey;
}

interface DialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  hideTrigger?: boolean;
}

function CategoryForm({ form, isPending, label }: FormProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-y-4">
      <form.Field
        name="name"
        children={(field) => <CategoryFormInputs.NameInput field={field} />}
      />

      <form.Field
        name="description"
        children={(field) => (
          <CategoryFormInputs.DescriptionInput field={field} />
        )}
      />
      <Button onPress={form.handleSubmit} isDisabled={isPending}>
        <Button.Label>{t(label)}</Button.Label>
      </Button>
    </View>
  );
}

function FormBottomSheet({
  isOpen,
  onOpenChange,
  children,
  hideTrigger,
}: DialogProps) {
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <BottomSheet.Trigger asChild>
          <Button isIconOnly size="lg">
            <MaterialIcons name="add" size={26} className="text-muted" />
          </Button>
        </BottomSheet.Trigger>
      )}
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
            {children}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

export function CreateCategoryForm() {
  const [open, isOpen] = useState(false);
  const mutationToast = useMutationToast("category-form-toast");
  const createCategory = useCreateCategoryMutation();

  const form = useCreateCategoryForm({
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
          KeyboardController.dismiss();
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
    <FormBottomSheet isOpen={open} onOpenChange={isOpen}>
      <CategoryForm
        form={form}
        isPending={createCategory.isPending}
        label="forms.category.create"
      />
    </FormBottomSheet>
  );
}

export function UpdateCategoryForm({
  category,
  onClose,
}: UpdateCategoryFormProps) {
  return (
    <FormBottomSheet
      isOpen={category !== null}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      hideTrigger
    >
      {category === null ? null : (
        <UpdateCategoryFormBody category={category} onClose={onClose} />
      )}
    </FormBottomSheet>
  );
}

function UpdateCategoryFormBody({
  category,
  onClose,
}: UpdateCategoryFormProps) {
  const mutationToast = useMutationToast("category-form-toast");
  const createCategory = useUpdateCategoryMutation();

  const form = useUpdateCategoryForm(
    {
      description: category?.description ?? "",
      name: category?.name ?? "",
    },
    {
      onSubmit: ({ value, resetForm }) => {
        if (!category) return;

        mutationToast.showIsPendingToast(
          "mutations.categories.update.is_pending"
        );

        createCategory.mutate(
          {
            id: category.id,
            name: value.name,
            description: value.description,
          },
          {
            onSuccess: () => {
              mutationToast.showSuccessToast(
                "mutations.categories.update.success.title",
                "mutations.categories.update.success.description"
              );
              KeyboardController.dismiss();
              resetForm();
              onClose();
            },
            onError: (error) => {
              mutationToast.showErrorToast(
                "mutations.categories.update.error",
                error.message as TranslationKey
              );
            },
          }
        );
      },
    }
  );

  return (
    <CategoryForm
      form={form}
      isPending={createCategory.isPending}
      label="forms.category.create"
    />
  );
}
