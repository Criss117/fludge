import {
  DescriptionInput,
  NameInput,
} from "@/core/catalog/components/category-form-inputs";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Column,
  Host,
  ModalBottomSheet,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useUpdateCategoryForm } from "@fludge/client/catalog/forms/category.form";
import { useUpdateCategoryMutation } from "@fludge/client/catalog/mutations/use-category.mutations";
import type { CategorySummary } from "@fludge/client/catalog/domain/category.repository";
import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "react-native";

interface Props {
  category: CategorySummary;
  onClose: () => void;
}

export function UpdateCategoryForm({ category, onClose }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const mutationToast = useMutationToast();
  const mutation = useUpdateCategoryMutation();
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const form = useUpdateCategoryForm(
    {
      name: category.name,
      description: category.description,
    },
    {
      onSubmit: ({ value, resetForm }) => {
        mutationToast.showPending("mutations.categories.update.is_pending");

        mutation.mutate(
          {
            id: category.id,
            name: value.name,
            description: value.description,
          },
          {
            onSuccess: async () => {
              mutationToast.showSuccess(
                "mutations.categories.update.success.title",
              );
              Keyboard.dismiss();
              await sheetRef.current?.hide();
              onClose();
              resetForm();
            },
            onError: (error) => {
              mutationToast.showError(
                "mutations.categories.update.error",
                error.message as TranslationKey,
              );
            },
          },
        );
      },
    },
  );

  const closeSheet = async () => {
    Keyboard.dismiss();
    await sheetRef.current?.hide();
    onClose();
  };

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onClose}
        skipPartiallyExpanded
        containerColor={colors.background}
        contentColor={colors.onBackground}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.md }}
          modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
        >
          <ThemedNativeText variant="h5">
            {t("forms.category.update.title")}
          </ThemedNativeText>

          <form.Field name="name">
            {(field) => <NameInput field={field} />}
          </form.Field>

          <form.Field name="description">
            {(field) => <DescriptionInput field={field} />}
          </form.Field>

          <Spacer modifiers={[width(SPACING.sm)]} />

          <Row horizontalArrangement={{ spacedBy: SPACING.sm }}>
            <Button
              modifiers={[weight(1)]}
              colors={{
                containerColor: colors.surface,
                contentColor: colors.onSurface,
              }}
              onClick={closeSheet}
            >
              <ThemedNativeText color={colors.onSurface}>
                {t("helpers.cancel")}
              </ThemedNativeText>
            </Button>
            <Button
              modifiers={[weight(1)]}
              colors={{
                containerColor: colors.primary,
                contentColor: colors.onPrimary,
              }}
              onClick={form.handleSubmit}
            >
              <ThemedNativeText color={colors.onPrimary}>
                {t("forms.category.update.submit")}
              </ThemedNativeText>
            </Button>
          </Row>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
