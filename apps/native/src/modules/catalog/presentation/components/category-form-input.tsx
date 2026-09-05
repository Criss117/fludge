import { CommonInputs } from "@/modules/shared/components/common-input";
import type { MinimalField } from "@fludge/client/shared/field-api";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="add-business"
      errors={errors}
      label="forms.category.name.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.category.name.placeholder",
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
      label="forms.category.description.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.category.description.placeholder",
      }}
    />
  );
}

export const CategoryFormInputs = {
  NameInput,
  DescriptionInput,
};
