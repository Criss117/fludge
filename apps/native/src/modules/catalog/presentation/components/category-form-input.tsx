import { CommonInputs } from "@/modules/shared/components/common-input";
import type { MinimalField } from "@fludge/client/shared/field-api";
import type { FocusEvent } from "react-native";

interface FieldProps<T> {
  field: MinimalField<T>;
  onFocus?: (e: FocusEvent) => void;
}

function NameInput({ field, onFocus }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isRequired
      isInvalid={isInvalid}
      icon="add-business"
      errors={errors}
      label="forms.category.name.label"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.category.name.placeholder",
      }}
    />
  );
}

function DescriptionInput({ field, onFocus }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextAreaInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.category.description.label"
      inputProps={{
        className: "bg-default",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        onFocus,
        placeholder: "forms.category.description.placeholder",
      }}
    />
  );
}

export const CategoryFormInputs = {
  NameInput,
  DescriptionInput,
};
