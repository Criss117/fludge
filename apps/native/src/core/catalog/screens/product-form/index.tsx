import { SectionCard } from "@/core/shared/components/section-card";
import {
  ThemedScrollView,
  ThemedView,
} from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";
import {
  Box,
  Button,
  Column,
  Host,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  type ProductFormSchema,
  useProductForm,
} from "@fludge/client/catalog/forms/product.form";
import { StyleSheet, View } from "react-native";
import { ProductFormInputs } from "@/core/catalog/components/product-form-inputs";
import {
  fillMaxWidth,
  padding,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useTranslation } from "react-i18next";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import {
  CreateProductPresentationForm,
  UpdateProductPresentationForm,
} from "@/core/catalog/components/product-presentation-form";
import { useState } from "react";
import { useRouter } from "expo-router";
import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@fludge/client/catalog/mutations/use-product.mutations";
import { useMutationToast } from "@/integrations/toast";
import type { TranslationKey } from "@fludge/i18n/index";

type Action =
  | {
      type: "create";
    }
  | {
      type: "update";
      product: ProductSummary;
    };

interface Props {
  action: Action;
}

function useUpsertProductForm(action: Action) {
  const router = useRouter();
  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const createToast = useMutationToast();
  const updateToast = useMutationToast();

  const form = useProductForm(
    {
      onSubmit: ({ value }) => {
        if (action.type === "create") {
          createToast.showPending("forms.product.create_toast.pending");
          createProduct.mutate(
            {
              name: value.name,
              description: value.description,
              categoryId: value.categoryId,
              stock: value.stock,
              allowNegativeStock: value.allowNegativeStock,
              minStock: value.minStock,
              presentations: value.presentations.map((p) => ({
                barcode: p.barcode,
                conversionFactor: p.conversionFactor,
                name: p.name,
                pricePurchase: p.pricePurchase,
                priceSale: p.priceSale,
                priceWholesale: p.priceWholesale,
                status: p.status,
              })),
            },
            {
              onSuccess: () => {
                router.back();
                createToast.showSuccess("forms.product.create_toast.success");
              },
              onError: (e) => {
                createToast.showError(
                  "forms.product.create_toast.error",
                  e.message as TranslationKey,
                );
              },
            },
          );

          return;
        }

        updateToast.showPending("forms.product.update_toast.pending");
        updateProduct.mutate(
          {
            id: action.product.id,
            name: value.name,
            description: value.description,
            categoryId: value.categoryId,
            stock: value.stock,
            allowNegativeStock: value.allowNegativeStock,
            minStock: value.minStock,
            status: value.status,
            presentations: value.presentations.map((p) => ({
              barcode: p.barcode,
              conversionFactor: p.conversionFactor,
              id: p.id,
              name: p.name,
              pricePurchase: p.pricePurchase,
              priceSale: p.priceSale,
              priceWholesale: p.priceWholesale,
              status: p.status,
            })),
          },
          {
            onSuccess: () => {
              router.back();
              updateToast.showSuccess("forms.product.update_toast.success");
            },
            onError: (e) => {
              updateToast.showError(
                "forms.product.update_toast.error",
                e.message as TranslationKey,
              );
            },
          },
        );
      },
    },
    action.type === "update"
      ? {
          allowNegativeStock: action.product.allowNegativeStock,
          categoryId: action.product.categoryId ?? "",
          description: action.product.description,
          name: action.product.name,
          stock: action.product.stock,
          status: action.product.status,
          minStock: action.product.minStock,
          presentations: action.product.presentations.map((p) => ({
            barcode: p.barcode ?? "",
            conversionFactor: p.conversionFactor,
            id: p.id,
            name: p.name,
            pricePurchase: p.pricePurchase ?? 0,
            priceSale: p.priceSale,
            priceWholesale: p.priceWholesale ?? 0,
            status: p.status,
          })),
        }
      : undefined,
  );

  return {
    form,
  };
}

export function ProductFormScreen({ action }: Props) {
  const [selectedPresentation, setSelectedPresentation] = useState<
    ProductFormSchema["presentations"][number] | null
  >(null);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const { form } = useUpsertProductForm(action);

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        contentContainerStyle={styles.contentContainer}

        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Host
          matchContents={{ vertical: true }}
          style={styles.basicInfoContainer}
        >
          <Column
            modifiers={[fillMaxWidth(), padding(SPACING.sm, 0, SPACING.sm, 0)]}
            verticalArrangement={{
              spacedBy: SPACING.md,
            }}
          >
            <SectionCard title="forms.product.sections.basic_information">
              <form.Field name="name">
                {(field) => <ProductFormInputs.NameInput field={field} />}
              </form.Field>
              <form.Field name="description">
                {(field) => (
                  <ProductFormInputs.DescriptionInput field={field} />
                )}
              </form.Field>
            </SectionCard>

            <SectionCard title="forms.product.sections.stock">
              <Row
                horizontalArrangement={{
                  spacedBy: SPACING.sm,
                }}
              >
                <Box modifiers={[weight(1)]}>
                  <form.Field name="stock">
                    {(field) => <ProductFormInputs.StockInput field={field} />}
                  </form.Field>
                </Box>
                <Box modifiers={[weight(1)]}>
                  <form.Field name="minStock">
                    {(field) => (
                      <ProductFormInputs.MinStockInput field={field} />
                    )}
                  </form.Field>
                </Box>
              </Row>
              <form.Field name="allowNegativeStock">
                {(field) => (
                  <ProductFormInputs.AllowNegativeStockInput field={field} />
                )}
              </form.Field>
            </SectionCard>

            <SectionCard
              title="forms.product.sections.presentations.title"
              action={
                <form.AppField name="presentations">
                  {(field) => (
                    <field.Presentations>
                      {(props) => (
                        <CreateProductPresentationForm onSubmit={props.add} />
                      )}
                    </field.Presentations>
                  )}
                </form.AppField>
              }
            >
              <form.Subscribe selector={(s) => s.values.presentations}>
                {(p) => {
                  if (p.length > 0) return null;
                  return (
                    <Column
                      horizontalAlignment="center"
                      verticalAlignment="center"
                      modifiers={[fillMaxWidth()]}
                    >
                      <ThemedNativeText variant="muted">
                        {t("forms.product.sections.presentations.empty")}
                      </ThemedNativeText>
                    </Column>
                  );
                }}
              </form.Subscribe>

              <form.AppField name="presentations">
                {(field) => (
                  <field.Presentations>
                    {({ field, remove, restore }) => (
                      <ProductFormInputs.PresentationCards
                        field={field}
                        remove={remove}
                        restore={restore}
                        onSelect={setSelectedPresentation}
                      />
                    )}
                  </field.Presentations>
                )}
              </form.AppField>
            </SectionCard>
          </Column>
        </Host>
      </ThemedScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={form.handleSubmit}
          >
            <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.product.submit")}
            </ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
      <Host matchContents>
        <form.AppField name="presentations">
          {(field) => (
            <field.Presentations>
              {({ update }) => (
                <UpdateProductPresentationForm
                  selectedPresentation={selectedPresentation}
                  close={() => setSelectedPresentation(null)}
                  onSubmit={(v) => update(v.id, v)}
                />
              )}
            </field.Presentations>
          )}
        </form.AppField>
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
});
