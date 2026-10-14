import { Icon } from "@/core/shared/components/icon";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
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
import {
  type ProductPresentationFormSchema,
  useProductPresentationForm,
} from "@fludge/client/catalog/forms/product-presentation.form";
import { useEffect, useRef, useState } from "react";
import { ProductPresentationFormInputs } from "../product-presentation-form-inputs";
import {
  fillMaxWidth,
  paddingAll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { SPACING } from "@/lib/sp";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useTranslation } from "react-i18next";
import type { ProductFormSchema } from "@fludge/client/catalog/forms/product.form";

interface Props {
  onSubmit: (value: ProductPresentationFormSchema) => void;
}

export function CreateProductPresentationForm({ onSubmit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useThemeColor();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      onSubmit(value);
      resetForm();
      close();
    },
  });

  return (
    <>
      <IconButton onClick={open}>
        <Icon name="add-circle" color={colors.primary} />
      </IconButton>
      <ProductPresentationForm close={close} isOpen={isOpen} form={form} />
    </>
  );
}

interface UpdateProps {
  onSubmit: (value: ProductFormSchema["presentations"][number]) => void;
  close: () => void;
  selectedPresentation: ProductFormSchema["presentations"][number] | null;
}

export function UpdateProductPresentationForm({
  onSubmit,
  close,
  selectedPresentation,
}: UpdateProps) {
  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      if (selectedPresentation === null) return;

      onSubmit({
        ...value,
        id: selectedPresentation.id,
      });
      resetForm();
      close();
    },
  });

  useEffect(() => {
    if (selectedPresentation === null) return;

    form.reset({
      name: selectedPresentation.name,
      barcode: selectedPresentation.barcode,
      conversionFactor: selectedPresentation.conversionFactor,
      priceSale: selectedPresentation.priceSale,
      pricePurchase: selectedPresentation.pricePurchase,
      priceWholesale: selectedPresentation.priceWholesale,
      status: selectedPresentation.status,
    });
  }, [form, selectedPresentation]);

  return (
    <ProductPresentationForm
      close={close}
      isOpen={selectedPresentation !== null}
      form={form}
    />
  );
}

interface ContentProps {
  isOpen: boolean;
  form: ReturnType<typeof useProductPresentationForm>;
  close: () => void;
}

function ProductPresentationForm({ close, isOpen, form }: ContentProps) {
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
        <Column
          verticalArrangement={{ spacedBy: SPACING.md }}
          modifiers={[fillMaxWidth()]}
        >
          <form.Field name="name">
            {(field) => (
              <ProductPresentationFormInputs.NameInput field={field} />
            )}
          </form.Field>

          <form.Field name="barcode">
            {(field) => (
              <ProductPresentationFormInputs.BarcodeInput field={field} />
            )}
          </form.Field>
        </Column>

        <Column
          verticalArrangement={{ spacedBy: SPACING.md }}
          modifiers={[fillMaxWidth()]}
        >
          <Row
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <Box modifiers={[weight(1)]}>
              <form.Field name="conversionFactor">
                {(field) => (
                  <ProductPresentationFormInputs.ConversionFactorInput
                    field={field}
                  />
                )}
              </form.Field>
            </Box>
            <Box modifiers={[weight(1)]}>
              <form.Field name="priceSale">
                {(field) => (
                  <ProductPresentationFormInputs.PriceSaleInput field={field} />
                )}
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
                {(field) => (
                  <ProductPresentationFormInputs.PricePurchaseInput
                    field={field}
                  />
                )}
              </form.Field>
            </Box>
            <Box modifiers={[weight(1)]}>
              <form.Field name="priceWholesale">
                {(field) => (
                  <ProductPresentationFormInputs.PriceWholesaleInput
                    field={field}
                  />
                )}
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
