import { Box, Button, Column, Host, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding, weight, width } from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ProductFormInputs } from "@/core/catalog/components/product-form-inputs";
import {
  CreateProductPresentationForm,
  UpdateProductPresentationForm,
} from "@/core/catalog/components/product-presentation-form";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { ProductFormScreenProps } from "./types";
import { useProductFormScreen } from "./use-product-form";

export function ProductFormScreen({ action }: ProductFormScreenProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const { actions, state, texts } = useProductFormScreen({ action });

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Host matchContents={{ vertical: true }} style={styles.basicInfoContainer}>
          <Column
            modifiers={[fillMaxWidth(), padding(SPACING.sm, 0, SPACING.sm, 0)]}
            verticalArrangement={{
              spacedBy: SPACING.md,
            }}
          >
            <SectionCard title={texts.sections.basic_information}>
              <state.form.Field name="name">
                {(field) => <ProductFormInputs.NameInput field={field} />}
              </state.form.Field>
              <state.form.Field name="description">
                {(field) => <ProductFormInputs.DescriptionInput field={field} />}
              </state.form.Field>
              <state.form.Field name="categoryId">
                {(field) => <ProductFormInputs.CategorySelectInput field={field} />}
              </state.form.Field>
            </SectionCard>

            <SectionCard title={texts.sections.stock}>
              <Row
                horizontalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <Box modifiers={[weight(1)]}>
                  <state.form.Field name="stock">
                    {(field) => <ProductFormInputs.StockInput field={field} />}
                  </state.form.Field>
                </Box>
                <Box modifiers={[weight(1)]}>
                  <state.form.Field name="minStock">
                    {(field) => <ProductFormInputs.MinStockInput field={field} />}
                  </state.form.Field>
                </Box>
              </Row>
              <state.form.Field name="allowNegativeStock">
                {(field) => <ProductFormInputs.AllowNegativeStockInput field={field} />}
              </state.form.Field>
            </SectionCard>
          </Column>
        </Host>
        <View style={styles.sectionContainer}>
          <View style={styles.presentationHeader}>
            <ThemedText variant="h5">{t(texts.sections.presentations.title)}</ThemedText>

            <Host matchContents>
              <state.form.AppField name="presentations">
                {(field) => (
                  <field.Presentations>
                    {(props) => <CreateProductPresentationForm onSubmit={props.add} />}
                  </field.Presentations>
                )}
              </state.form.AppField>
            </Host>
          </View>
          <state.form.Subscribe selector={(s) => s.values.presentations}>
            {(p) => {
              if (p.length > 0) return null;
              return (
                <View style={styles.emptyContainer}>
                  <ThemedText variant="muted">{t(texts.sections.presentations.empty)}</ThemedText>
                </View>
              );
            }}
          </state.form.Subscribe>

          <state.form.AppField name="presentations">
            {(field) => (
              <field.Presentations>
                {({ field, remove, restore }) => (
                  <ProductFormInputs.PresentationCards
                    field={field}
                    remove={remove}
                    restore={restore}
                    onSelect={actions.setSelectedPresentation}
                  />
                )}
              </field.Presentations>
            )}
          </state.form.AppField>
        </View>
      </ThemedScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={actions.submit}
          >
            <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>{t(texts.submit)}</ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
      <Host matchContents>
        <state.form.AppField name="presentations">
          {(field) => (
            <field.Presentations>
              {({ update }) => (
                <UpdateProductPresentationForm
                  selectedPresentation={state.selectedPresentation}
                  close={() => actions.setSelectedPresentation(null)}
                  onSubmit={(v) => update(v.id, v)}
                />
              )}
            </field.Presentations>
          )}
        </state.form.AppField>
      </Host>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  basicInfoContainer: {
    width: "100%",
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    rowGap: SPACING.md,
  },
  contentContainer: {
    paddingBottom: SPACING.md,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.md,
  },
  presentationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
