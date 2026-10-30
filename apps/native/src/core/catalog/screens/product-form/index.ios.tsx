import { Host, HStack, VStack } from "@expo/ui/swift-ui";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ProductFormInputs } from "@/core/catalog/components/product-form-inputs";
import {
  CreateProductPresentationForm,
  UpdateProductPresentationForm,
} from "@/core/catalog/components/product-presentation-form";
import type { ProductFormScreenProps } from "@/core/catalog/screens/product-form/types";
import { useProductFormScreen } from "@/core/catalog/screens/product-form/use-product-form";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

function StackConfing({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.backward" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={onSubmit}>
          <Stack.Toolbar.Label>{t("forms.product.submit")}</Stack.Toolbar.Label>
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}

export function ProductFormScreen(props: ProductFormScreenProps) {
  const { t } = useTranslation();
  const { actions, state, texts } = useProductFormScreen(props);

  // return null;

  return (
    <>
      <StackConfing onSubmit={actions.submit} />
      <ThemedView style={styles.container}>
        <ThemedScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.sectionContainer}>
            <ThemedText variant="h5">{t(texts.sections.basic_information)}</ThemedText>
            <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="container">
              <VStack spacing={SPACING.md}>
                <state.form.Field name="name">
                  {(field) => <ProductFormInputs.NameInput field={field} />}
                </state.form.Field>

                <state.form.Field name="description">
                  {(field) => <ProductFormInputs.DescriptionInput field={field} />}
                </state.form.Field>

                <state.form.Field name="categoryId">
                  {(field) => <ProductFormInputs.CategorySelectInput field={field} />}
                </state.form.Field>
              </VStack>
            </Host>
          </View>

          <View style={styles.sectionContainer}>
            <ThemedText variant="h5">{t(texts.sections.basic_information)}</ThemedText>
            <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="container">
              <VStack spacing={SPACING.md}>
                <HStack spacing={SPACING.sm} alignment="top">
                  <state.form.Field name="stock">
                    {(field) => <ProductFormInputs.StockInput field={field} />}
                  </state.form.Field>

                  <state.form.Field name="minStock">
                    {(field) => <ProductFormInputs.MinStockInput field={field} />}
                  </state.form.Field>
                </HStack>

                <state.form.Field name="allowNegativeStock">
                  {(field) => <ProductFormInputs.AllowNegativeStockInput field={field} />}
                </state.form.Field>
              </VStack>
            </Host>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.presentationHeader}>
              <ThemedText variant="h5">{t(texts.sections.presentations.title)}</ThemedText>

              <Host matchContents ignoreSafeArea="container">
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
        <KeyboardSpacerView />
        <Host matchContents ignoreSafeArea="container">
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
    </>
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
  contentContainer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xl,
    rowGap: SPACING["xl"],
  },
  sectionContainer: {
    rowGap: SPACING.md,
    overflow: "visible",
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
  host: {
    alignSelf: "stretch",
  },
});
