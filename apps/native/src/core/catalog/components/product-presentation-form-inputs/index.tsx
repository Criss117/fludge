import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { TextInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";
import { Box, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { MinimalField } from "@fludge/client/shared/field-api";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.product_presentation.name.label"
      placeholder="forms.product_presentation.name.placeholder"
      iconName="badge"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function BarcodeInput({ field }: FieldProps<string>) {
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
          value={field.state.value}
          label="forms.product_presentation.barcode.label"
          placeholder="forms.product_presentation.barcode.placeholder"
          iconName="barcode"
          modifiers={[fillMaxWidth()]}
          isError={isInvalid}
          onValueChange={field.handleChange}
          errors={field.state.meta.errors}
        />
      </Box>

      <BarcodeReader setBarcode={field.handleChange} />
    </Row>
  );
}

function ConversionFactorInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product_presentation.conversion_factor.label"
      placeholder="forms.product_presentation.conversion_factor.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function PriceSaleInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product_presentation.price_sale.label"
      placeholder="forms.product_presentation.price_sale.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function PricePurchaseInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product_presentation.price_purchase.label"
      placeholder="forms.product_presentation.price_purchase.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function PriceWholesaleInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.product_presentation.price_wholesale.label"
      placeholder="forms.product_presentation.price_wholesale.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
