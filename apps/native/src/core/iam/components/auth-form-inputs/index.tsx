import { TextInput } from "@/core/shared/components/text-input";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type { MinimalField } from "@fludge/client/shared/field-api";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.auth.name.label"
      placeholder="forms.auth.name.placeholder"
      iconName="badge"
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
      label="forms.auth.password.label"
      placeholder="forms.auth.password.placeholder"
      iconName="password"
      visualTransformation="password"
      keyboardOptions={{
        keyboardType: "password",
        autoCorrectEnabled: false,
        capitalization: "none",
      }}
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
      iconName="mail"
      label="forms.auth.email.label"
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
      iconName="call"
      label="forms.auth.phone.label"
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
