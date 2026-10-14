import { TextInput } from "@/core/shared/components/text-input";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type { MinimalField } from "@fludge/client/shared/field-api";

interface InputProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.category.name.label"
      placeholder="forms.category.name.placeholder"
      iconName="label"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function DescriptionInput({ field }: InputProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.category.description.label"
      placeholder="forms.category.description.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      minLines={5}
    />
  );
}

export const CategoryFormInputs = {
  NameInput,
  DescriptionInput,
};
