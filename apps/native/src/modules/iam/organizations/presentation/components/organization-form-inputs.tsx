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
      errors={errors}
      label="forms.organization.name.label"
      icon="add-business"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.organization.name.placeholder",
      }}
    />
  );
}

function LegalNameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.organization.legal_name.label"
      icon="apartment"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.organization.legal_name.placeholder",
      }}
    />
  );
}

function TaxIdInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.organization.tax_id.label"
      icon="badge"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.organization.tax_id.placeholder",
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
      errors={errors}
      label="forms.organization.phone.label"
      icon="phone"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.organization.phone.placeholder",
      }}
    />
  );
}

function AddressInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      errors={errors}
      label="forms.organization.address.label"
      icon="apartment"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.organization.address.placeholder",
      }}
    />
  );
}

// react-doctor-disable-next-line only-export-components -- This component namespace is the public form-input composition API.
export const OrganizationFormInputs = {
  NameInput,
  LegalNameInput,
  TaxIdInput,
  PhoneInput,
  AddressInput,
};
