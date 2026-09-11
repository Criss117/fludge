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
      icon="person-outline"
      errors={errors}
      label="forms.user.name.label"
      inputProps={{
        id: "sign-up-form-name",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.user.name.placeholder",
      }}
    />
  );
}

function PhoneInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="phone"
      errors={errors}
      label="forms.user.phone.label"
      inputProps={{
        id: "sign-up-form-phone",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.user.phone.placeholder",
        keyboardType: "phone-pad",
      }}
    />
  );
}

function EmailInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="mail-outline"
      errors={errors}
      label="forms.user.email.label"
      inputProps={{
        id: "sign-up-form-email",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.user.email.placeholder",
      }}
    />
  );
}

function PasswordInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.PasswordInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.user.password.label"
      inputProps={{
        id: "sign-up-form-password",
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.user.password.placeholder",
      }}
    />
  );
}

// react-doctor-disable-next-line only-export-components -- This component namespace is the public form-input composition API.
export const AuthFormInputs = {
  NameInput,
  PhoneInput,
  EmailInput,
  PasswordInput,
};
