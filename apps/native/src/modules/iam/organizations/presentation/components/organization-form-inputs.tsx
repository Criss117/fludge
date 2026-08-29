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
      label="Nombre Comercial"
      icon="add-business"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "Ej. Tienda Andres",
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
      label="Razón Social"
      icon="apartment"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "Ej. Tienda Andres S.A.S.",
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
      label="Identificación Fiscal (Tax ID / NIT / RFC)"
      icon="badge"
      inputProps={{
        id,
        value,
        onBlur,
        onChangeText,
        placeholder: "Ingresa el código único",
      }}
    />
  );
}

export const OrganizationFormInputs = {
  NameInput,
  LegalNameInput,
  TaxIdInput,
};
