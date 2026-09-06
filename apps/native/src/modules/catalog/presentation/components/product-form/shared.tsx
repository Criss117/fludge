import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { CommonInputs } from "@/modules/shared/components/common-input";
import { useFindCategories } from "@fludge/client/application/catalog/queries/use-find-categories";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { useMemo } from "react";
import { type FocusEvent, View } from "react-native";

interface FieldProps<T> {
  field: MinimalField<T>;
  onFocus?: (e: FocusEvent) => void;
}

function Name({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="add-business"
      errors={errors}
      label="forms.product.name.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.name.placeholder",
      }}
    />
  );
}

function Description({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextAreaInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.description.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.description.placeholder",
      }}
    />
  );
}

function Stock({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      icon="attach-money"
      label="forms.product.stock.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.stock.placeholder",
      }}
    />
  );
}

function AllowNegativeStock({ field }: FieldProps<boolean>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.SwitchInput
      isInvalid={isInvalid}
      isSelected={field.state.value}
      label="forms.product.allow_negative_stock.label"
      description="forms.product.allow_negative_stock.description"
      onSelectedChange={field.handleChange}
      errors={errors}
    />
  );
}

function MinStock({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.min_stock.label"
      icon="attach-money"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.min_stock.placeholder",
      }}
    />
  );
}

function CategorySelect({ field }: FieldProps<string>) {
  const { data } = useFindCategories();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const options = useMemo(
    () =>
      data.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [data]
  );

  const value = field.state.value
    ? options.find((o) => o.value === field.state.value)
    : undefined;

  return (
    <CommonInputs.SearchableSelect
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.categories.add"
      options={options}
      onChange={(option) => {
        field.handleChange(option.value);
      }}
      value={value}
    />
  );
}

export const ProductFormInputs = {
  Name,
  Description,
  Stock,
  AllowNegativeStock,
  MinStock,
  CategorySelect,
};

function PresentationName({ field, onFocus }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isRequired
      isInvalid={isInvalid}
      icon="add-business"
      errors={errors}
      label="forms.product_presentation.name.label"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.product_presentation.name.placeholder",
      }}
    />
  );
}

function PresentationBarcode({ field, onFocus }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <View className="flex-row items-end gap-x-1">
      <View className="flex-1">
        <CommonInputs.TextInput
          isInvalid={isInvalid}
          icon="barcode-reader"
          errors={errors}
          label="forms.product_presentation.barcode.label"
          inputProps={{
            className: "bg-default",
            value: field.state.value,
            onBlur: field.handleBlur,
            onChangeText: field.handleChange,
            onFocus,
            placeholder: "forms.product_presentation.barcode.placeholder",
          }}
        />
      </View>
      <CameraDialog setBarcode={field.handleChange} />
    </View>
  );
}

function PresentationConversionFactor({ field, onFocus }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.conversion_factor.label"
      icon="expand-less"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.product_presentation.conversion_factor.placeholder",
      }}
    />
  );
}

function PresentationPiceSale({ field, onFocus }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_sale.label"
      icon="attach-money"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.product_presentation.price_sale.placeholder",
      }}
    />
  );
}

function PresentationPricePurchase({ field, onFocus }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_purchase.label"
      icon="attach-money"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.product_presentation.price_purchase.placeholder",
      }}
    />
  );
}

function PresentationPriceWholesale({ field, onFocus }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product_presentation.price_wholesale.label"
      icon="attach-money"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.product_presentation.price_wholesale.placeholder",
      }}
    />
  );
}

export const ProductPresentationFormInputs = {
  Name: PresentationName,
  Barcode: PresentationBarcode,
  ConversionFactor: PresentationConversionFactor,
  PriceSale: PresentationPiceSale,
  PricePurchase: PresentationPricePurchase,
  PriceWholesale: PresentationPriceWholesale,
};
