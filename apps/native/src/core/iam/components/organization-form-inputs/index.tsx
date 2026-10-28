import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
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
      label="forms.organization.phone.label"
      placeholder="forms.organization.phone.placeholder"
      iconName="phone"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "phone",
      }}
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
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
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
