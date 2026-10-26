import { HStack } from "@expo/ui/swift-ui";
import { useState } from "react";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { TextInput } from "@/core/shared/components/text-input";
import type { InputProps } from "@/core/shared/components/text-input/types";

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.product_presentation.name.label"
      placeholder="forms.product_presentation.name.placeholder"
      iconName="badge"

      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function BarcodeInput({ field }: InputProps<string>) {
  const [barcodeReaderIndex, setBarcodeReaderIndex] = useState(0);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleBarcodeChange = (barcode: string) => {
    field.handleChange(barcode);
    setBarcodeReaderIndex((p) => p + 1);
  };

  return (
    <HStack>
      <TextInput
        label="forms.product_presentation.barcode.label"
        placeholder="forms.product_presentation.barcode.placeholder"
        iconName="barcode"
        isError={isInvalid}
        onValueChange={field.handleChange}
        errors={field.state.meta.errors}
        defaultValue={field.state.value}
        key={barcodeReaderIndex}
      />
      <BarcodeReader setBarcode={handleBarcodeChange} />
    </HStack>
  );
}

function ConversionFactorInput({ field }: InputProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.product_presentation.conversion_factor.label"
      placeholder="forms.product_presentation.conversion_factor.placeholder"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
