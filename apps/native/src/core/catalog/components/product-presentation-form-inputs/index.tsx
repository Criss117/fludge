import { Box, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { TextInput } from "@/core/shared/components/text-input";
import type { InputProps } from "@/core/shared/components/text-input/types";
import { SPACING } from "@/lib/sp";

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.product_presentation.name.label"
      placeholder="forms.product_presentation.name.placeholder"
      iconName="badge"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function BarcodeInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Row
      modifiers={[fillMaxWidth()]}
      verticalAlignment="center"
      horizontalAlignment="center"
      horizontalArrangement={{
        spacedBy: SPACING.sm,
      }}
    >
      <Box modifiers={[weight(1)]}>
        <TextInput
          label="forms.product_presentation.barcode.label"
          placeholder="forms.product_presentation.barcode.placeholder"
          iconName="barcode"
          modifiers={[fillMaxWidth()]}
          isError={isInvalid}
          onValueChange={field.handleChange}
          errors={field.state.meta.errors}
          defaultValue={field.state.value}
        />
      </Box>

      <BarcodeReader setBarcode={field.handleChange} />
    </Row>
  );
}

function ConversionFactorInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product_presentation.conversion_factor.label"
      placeholder="forms.product_presentation.conversion_factor.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function PriceSaleInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product_presentation.price_sale.label"
      placeholder="forms.product_presentation.price_sale.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function PricePurchaseInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product_presentation.price_purchase.label"
      placeholder="forms.product_presentation.price_purchase.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function PriceWholesaleInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product_presentation.price_wholesale.label"
      placeholder="forms.product_presentation.price_wholesale.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

export const ProductPresentationFormInputs = {
  NameInput,
  BarcodeInput,
  ConversionFactorInput,
  PriceSaleInput,
  PricePurchaseInput,
  PriceWholesaleInput,
};
