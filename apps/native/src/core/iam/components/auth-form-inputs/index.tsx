import { TextInput } from "@/core/shared/components/text-input";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { MinimalField } from "@fludge/client/shared/field-api";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      placeholder="forms.auth.name.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function PasswordInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      placeholder="forms.auth.password.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function EmailInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      keyboardOptions={{
        keyboardType: "email",
      }}
      placeholder="forms.auth.email.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

function PhoneInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      keyboardOptions={{
        keyboardType: "phone",
      }}
      placeholder="forms.auth.phone.placeholder"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

export const AuthFormInputs = {
  NameInput,
  PasswordInput,
  EmailInput,
  PhoneInput,
};
