import type { MinimalField } from "@fludge/client/shared/field-api";

import { TextInput } from "@/core/shared/components/text-input";

interface FieldProps<T> {
  field: MinimalField<T>;
}

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.organization.name.label"
      placeholder="forms.organization.name.placeholder"
      iconName="add"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function PhoneInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.organization.phone.label"
      placeholder="forms.organization.phone.placeholder"
      iconName="phone"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "phone",
      }}
      defaultValue={field.state.value}
    />
  );
}

function LegalNameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.organization.legal_name.label"
      placeholder="forms.organization.legal_name.placeholder"
      iconName="label"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function TaxIdInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.organization.tax_id.label"
      placeholder="forms.organization.tax_id.placeholder"
      iconName="user-name"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function AddressInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.organization.address.label"
      placeholder="forms.organization.address.placeholder"
      iconName="location"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

export const OrganizationFormInputs = {
  NameInput,
  PhoneInput,
  LegalNameInput,
  TaxIdInput,
  AddressInput,
};
