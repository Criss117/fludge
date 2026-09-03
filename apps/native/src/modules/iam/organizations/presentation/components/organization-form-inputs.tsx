import { CommonInput } from "@/modules/shared/components/common-input";
import type { BlurEvent } from "react-native";

interface Props {
  isInvalid: boolean;
  id: string;
  value: string;
  errors?: Array<{ message?: string } | undefined>;
  onBlur: (e: BlurEvent) => void;
  onChangeText: (text: string) => void;
}

function NameInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
       label="forms.organization.name.label"
      icon="add-business"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
         placeholder: "forms.organization.name.placeholder",
      }}
    />
  );
}

function LegalNameInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
       label="forms.organization.legal_name.label"
      icon="apartment"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
         placeholder: "forms.organization.legal_name.placeholder",
      }}
    />
  );
}

function TaxIdInput({
  isInvalid,
  id,
  value,
  onBlur,
  onChangeText,
  errors,
}: Props) {
  return (
    <CommonInput
      isInvalid={isInvalid}
      errors={errors}
       label="forms.organization.tax_id.label"
      icon="badge"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
         placeholder: "forms.organization.tax_id.placeholder",
      }}
    />
  );
}

export const OrganizationFormInputs = {
  NameInput,
  LegalNameInput,
  TaxIdInput,
};
