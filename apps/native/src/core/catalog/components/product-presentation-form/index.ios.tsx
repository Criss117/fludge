import { BottomSheet, Button, HStack, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  frame,
  padding,
  presentationBackground,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";

import { ProductPresentationFormInputs } from "@/core/catalog/components/product-presentation-form-inputs";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type {
  CreateProductPresentationFormProps,
  ProductPresentationFormContentProps,
  UpdateProductPresentationFormProps,
} from "./types";
import {
  useCreateProductPresentationForm,
  useUpdateProductPresentationForm,
} from "./use-product-presentation-form";

export function CreateProductPresentationForm(props: CreateProductPresentationFormProps) {
  const colors = useThemeColor();
  const { actions, state } = useCreateProductPresentationForm(props);

  return (
    <>
      <Button onPress={actions.open}>
        <Icon name="add-circle" color={colors.primary} />
      </Button>
      <ProductPresentationForm close={actions.close} isOpen={state.isOpen} form={state.form} />
    </>
  );
}

export function UpdateProductPresentationForm(props: UpdateProductPresentationFormProps) {
  const { state, actions } = useUpdateProductPresentationForm(props);

  return (
    <ProductPresentationForm
      close={actions.close}
      isOpen={state.selectedPresentation !== null}
      form={state.form}
    />
  );
}

export function ProductPresentationForm({
  close,
  isOpen,
  form,
}: ProductPresentationFormContentProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <VStack>
      <BottomSheet
        isPresented={isOpen}
        onIsPresentedChange={(v) => {
          if (!v) close();
        }}
        fitToContents
      >
        <VStack
          modifiers={[
            padding({
              horizontal: SPACING.md,
              top: SPACING["2xl"],
              bottom: SPACING["2xl"],
            }),
            presentationBackground(colors.background),
          ]}
          spacing={SPACING["xl"]}
        >
          <HStack>
            <ThemedNativeText variant="h5" color={colors.primary}>
              {t("forms.product_presentation.title")}
            </ThemedNativeText>
          </HStack>

          <VStack>
            <form.Field name="name">
              {(field) => <ProductPresentationFormInputs.NameInput field={field} />}
            </form.Field>
            <form.Field name="barcode">
              {(field) => <ProductPresentationFormInputs.BarcodeInput field={field} />}
            </form.Field>
          </VStack>

          <VStack>
            <HStack alignment="top">
              <form.Field name="conversionFactor">
                {(field) => <ProductPresentationFormInputs.ConversionFactorInput field={field} />}
              </form.Field>
              <form.Field name="priceSale">
                {(field) => <ProductPresentationFormInputs.PriceSaleInput field={field} />}
              </form.Field>
            </HStack>

            <HStack alignment="top">
              <form.Field name="pricePurchase">
                {(field) => <ProductPresentationFormInputs.PricePurchaseInput field={field} />}
              </form.Field>
              <form.Field name="priceWholesale">
                {(field) => <ProductPresentationFormInputs.PriceWholesaleInput field={field} />}
              </form.Field>
            </HStack>
          </VStack>

          <Button
            onPress={form.handleSubmit}
            modifiers={[buttonStyle("borderedProminent"), tint(colors.primary)]}
          >
            <HStack
              modifiers={[
                frame({
                  maxWidth: Infinity,
                }),
              ]}
            >
              <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
              <ThemedNativeText color={colors.onPrimary}>
                {t("forms.product_presentation.submit")}
              </ThemedNativeText>
            </HStack>
          </Button>
        </VStack>
      </BottomSheet>
    </VStack>
  );
}
