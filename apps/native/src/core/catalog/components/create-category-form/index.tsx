import { CategoryFormInputs } from "@/core/catalog/components/category-form-inputs";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Column,
  FloatingActionButton,
  Host,
  ModalBottomSheet,
  OutlinedButton,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useCreateCategoryForm } from "@fludge/client/catalog/forms/category.form";
import { useCreateCategoryMutation } from "@fludge/client/catalog/mutations/use-category.mutations";
import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, StyleSheet, View } from "react-native";

export function CreateCategoryForm() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const mutationToast = useMutationToast();
  const mutation = useCreateCategoryMutation();
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const form = useCreateCategoryForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showPending("mutations.categories.create.is_pending");

      mutation.mutate(value, {
        onSuccess: async () => {
          mutationToast.showSuccess(
            "mutations.categories.create.success.title",
          );
          Keyboard.dismiss();
          await sheetRef.current?.hide();
          setIsOpen(false);
          resetForm();
        },
        onError: (error) => {
          mutationToast.showError(
            "mutations.categories.create.error",
            error.message as TranslationKey,
          );
        },
      });
    },
  });

  const closeSheet = async () => {
    Keyboard.dismiss();
    await sheetRef.current?.hide();
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Host matchContents>
        <FloatingActionButton
          containerColor={colors.primary}
          onClick={() => setIsOpen(true)}
        >
          <FloatingActionButton.Icon>
            <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>

        {isOpen && (
          <ModalBottomSheet
            ref={sheetRef}
            onDismissRequest={() => setIsOpen(false)}
            skipPartiallyExpanded
            containerColor={colors.background}
            contentColor={colors.onBackground}
          >
            <Column
              verticalArrangement={{ spacedBy: SPACING.md }}
              modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
            >
              <ThemedNativeText variant="h5">
                {t("forms.category.create.title")}
              </ThemedNativeText>

              <form.Field name="name">
                {(field) => <CategoryFormInputs.NameInput field={field} />}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <CategoryFormInputs.DescriptionInput field={field} />
                )}
              </form.Field>

              <Spacer modifiers={[width(SPACING.sm)]} />

              <Row horizontalArrangement={{ spacedBy: SPACING.sm }}>
                <OutlinedButton
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
                </OutlinedButton>
                <Button
                  modifiers={[weight(1)]}
                  colors={{
                    containerColor: colors.primary,
                    contentColor: colors.onPrimary,
                  }}
                  onClick={form.handleSubmit}
                >
                  <ThemedNativeText color={colors.onPrimary}>
                    {t("forms.category.create.submit")}
                  </ThemedNativeText>
                </Button>
              </Row>
            </Column>
          </ModalBottomSheet>
        )}
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.md,
  },
});
