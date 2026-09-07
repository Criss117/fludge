import { MaterialIcons } from "@/modules/shared/components/icons";
import {
  useCreateCategoryForm,
  useUpdateCategoryForm,
} from "@fludge/client/application/catalog/form/category-form";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useBottomSheetAwareHandlers } from "heroui-native";
import { Separator } from "heroui-native/separator";

type Form =
  | ReturnType<typeof useCreateCategoryForm>
  | ReturnType<typeof useUpdateCategoryForm>;

interface UpdateCategoryFormProps {
  category: CategorySummary | null;
  onClose: () => void;
}

interface FormProps {
  form: Form;
}

interface FooterProps {
  form: Form;
  isPending: boolean;
  label: TranslationKey;
  closeSheet: () => void;
}

interface DialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  footerComponent: React.ReactNode;
  hideTrigger?: boolean;
  title: TranslationKey;
}

function FooterComponent({ form, isPending, label, closeSheet }: FooterProps) {
  const { t } = useTranslation();
  return (
    <View className="pb-safe-offset-8 bg-overlay px-4">
      <Separator className="-mx-4 mb-3" />
      <View className="flex-row gap-x-2">
        <Button variant="outline" className="flex-1" onPress={closeSheet}>
          <MaterialIcons name="close" size={20} className="text-foreground" />
          <Button.Label className="text-foreground">
            {t("helpers.cancel")}
          </Button.Label>
        </Button>
        <Button
          className="flex-1"
          onPress={form.handleSubmit}
          isDisabled={isPending}
        >
          <MaterialIcons name="add" size={20} className="text-eclipse" />
          <Button.Label className="text-eclipse">{t(label)}</Button.Label>
        </Button>
      </View>
    </View>
  );
}

function CategoryForm({ form }: FormProps) {
  const { onFocus } = useBottomSheetAwareHandlers();
  return (
    <View className="mb-4 gap-y-2 px-3">
      <form.Field
        name="name"
        children={(field) => (
          <CategoryFormInputs.NameInput field={field} onFocus={onFocus} />
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <CategoryFormInputs.DescriptionInput
            field={field}
            onFocus={onFocus}
          />
        )}
      />
    </View>
  );
}

function FormBottomSheet({
  isOpen,
  onOpenChange,
  children,
  hideTrigger,
  footerComponent,
  title,
}: DialogProps) {
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>{footerComponent}</BottomSheetFooter>
    ),
    [footerComponent]
  );

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
          contentContainerClassName="px-3 h-full"
          onClose={() => {
            KeyboardController.dismiss();
          }}
          footerComponent={renderFooter}
        >
          <View className="flex-row items-center justify-between gap-4 px-3 pb-3">
            <BottomSheet.Title maxFontSizeMultiplier={1.2} numberOfLines={1}>
              {t(title)}
            </BottomSheet.Title>
            <BottomSheet.Close />
          </View>

          <Separator className="pb-safe-offset -mx-5" />
          <BottomSheetScrollView
            contentContainerClassName="pb-safe-offset-32"
            showsVerticalScrollIndicator={false}
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
    <FormBottomSheet
      isOpen={open}
      onOpenChange={isOpen}
      title="forms.category.create.title"
      footerComponent={
        <FooterComponent
          form={form}
          isPending={createCategory.isPending}
          label="forms.category.create.submit"
          closeSheet={() => isOpen(false)}
        />
      }
    >
      <CategoryForm form={form} />
    </FormBottomSheet>
  );
}

export function UpdateCategoryForm({
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

  useEffect(() => {
    if (!category) return;

    form.setFieldValue("name", category.name);
    form.setFieldValue("description", category.description);
  }, [category]);

  return (
    <FormBottomSheet
      isOpen={category !== null}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      hideTrigger
      title="forms.category.update.title"
      footerComponent={
        <FooterComponent
          form={form}
          isPending={createCategory.isPending}
          label="forms.category.update.submit"
          closeSheet={onClose}
        />
      }
    >
      <CategoryForm form={form} />
    </FormBottomSheet>
  );
}
