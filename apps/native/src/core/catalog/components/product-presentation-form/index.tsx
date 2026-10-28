import {
  Box,
  Button,
  Column,
  IconButton,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { ProductPresentationFormInputs } from "../product-presentation-form-inputs";
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
      <IconButton onClick={actions.open}>
        <Icon name="add" color={colors.primary} />
      </IconButton>
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
      key={state.selectedPresentation?.id}
    />
  );
}

export function ProductPresentationForm({
  close,
  isOpen,
  form,
}: ProductPresentationFormContentProps) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const colors = useThemeColor();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <ModalBottomSheet
      ref={sheetRef}
      onDismissRequest={close}
      skipPartiallyExpanded
      containerColor={colors.background}
    >
      <Column
        verticalArrangement={{ spacedBy: SPACING["2xl"] }}
        modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
      >
        <Column verticalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
          <form.Field name="name">
            {(field) => <ProductPresentationFormInputs.NameInput field={field} />}
          </form.Field>

          <form.Field name="barcode">
            {(field) => <ProductPresentationFormInputs.BarcodeInput field={field} />}
          </form.Field>
        </Column>

        <Column verticalArrangement={{ spacedBy: SPACING.md }} modifiers={[fillMaxWidth()]}>
          <Row
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <Box modifiers={[weight(1)]}>
              <form.Field name="conversionFactor">
                {(field) => <ProductPresentationFormInputs.ConversionFactorInput field={field} />}
              </form.Field>
            </Box>
            <Box modifiers={[weight(1)]}>
              <form.Field name="priceSale">
                {(field) => <ProductPresentationFormInputs.PriceSaleInput field={field} />}
              </form.Field>
            </Box>
          </Row>

          <Row
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <Box modifiers={[weight(1)]}>
              <form.Field name="pricePurchase">
                {(field) => <ProductPresentationFormInputs.PricePurchaseInput field={field} />}
              </form.Field>
            </Box>
            <Box modifiers={[weight(1)]}>
              <form.Field name="priceWholesale">
                {(field) => <ProductPresentationFormInputs.PriceWholesaleInput field={field} />}
              </form.Field>
            </Box>
          </Row>
        </Column>
      </Column>
      <Spacer modifiers={[weight(1)]} />
      <Box modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}>
        <Button
          modifiers={[fillMaxWidth()]}
          colors={{
            containerColor: colors.primary,
          }}
          onClick={form.handleSubmit}
        >
          <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
          <ThemedNativeText color={colors.onPrimary}>
            {t("forms.product_presentation.submit")}
          </ThemedNativeText>
        </Button>
      </Box>
    </ModalBottomSheet>
  );
}
