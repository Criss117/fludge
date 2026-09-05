import { CommonInputs } from "@/modules/shared/components/common-input";
import { useFindCategories } from "@fludge/client/application/catalog/queries/use-find-categories";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { useMemo } from "react";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isRequired
      isInvalid={isInvalid}
      icon="shopping-bag"
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

function DescriptionInput({ field }: FieldProps<string>) {
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

function StockInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.stock.label"
      icon="storage"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.stock.placeholder",
      }}
    />
  );
}

function MinStockInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.min_stock.label"
      icon="notification-important"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.product.min_stock.placeholder",
      }}
    />
  );
}

function AllowNegativeStockInput({ field }: FieldProps<boolean>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.SwitchInput
      isInvalid={isInvalid}
      isSelected={field.state.value}
      onSelectedChange={field.handleChange}
      errors={errors}
      description="forms.product.allow_negative_stock.description"
      label="forms.product.allow_negative_stock.label"
    />
  );
}

function SelectCategories({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;
  const categories = useFindCategories();

  const options = useMemo(() => {
    return categories.data.map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }, [categories.data]);

  const value = options.find((o) => o.value === field.state.value);

  return (
    <CommonInputs.SearchableSelect
      isInvalid={isInvalid}
      errors={errors}
      label="forms.product.categories.label"
      options={options}
      onChange={(v) => field.handleChange(v.value)}
      value={value}
    />
  );
}

export const ProductFormInputs = {
  NameInput,
  DescriptionInput,
  StockInput,
  MinStockInput,
  AllowNegativeStockInput,
  SelectCategories,
};
