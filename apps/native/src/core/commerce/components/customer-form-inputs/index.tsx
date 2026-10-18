import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  OutlinedTextField,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, menuAnchor } from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerFormSchema } from "@fludge/client/commerce/forms/customer.form";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { customerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { FIELD_SHAPE, TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

interface FieldProps<T> {
  field: MinimalField<T>;
}

type DocumentTypeValue = CustomerFormSchema["documentType"];

const documentTypeOptions: { label: string; value: DocumentTypeValue }[] =
  customerDocumentTypeEnum.map((value) => ({
    label: value,
    value,
  }));

export function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.customer.name.label"
      placeholder="forms.customer.name.placeholder"
      iconName="person"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

export function DocumentTypeInput({ field }: FieldProps<DocumentTypeValue>) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [expanded, setExpanded] = useState(false);

  const selectedLabel = useMemo(
    () => documentTypeOptions.find((o) => o.value === field.state.value)?.label ?? "",
    [field.state.value],
  );
  const nativeLabel = useNativeState(selectedLabel);

  useEffect(() => {
    nativeLabel.set(selectedLabel);
  }, [selectedLabel, nativeLabel]);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <ExposedDropdownMenuBox
      expanded={expanded}
      onExpandedChange={setExpanded}
      modifiers={[fillMaxWidth()]}
    >
      <OutlinedTextField
        value={nativeLabel}
        readOnly
        modifiers={[menuAnchor(), fillMaxWidth()]}
        isError={isInvalid}
        shape={FIELD_SHAPE}
        colors={{
          focusedIndicatorColor: colors.primary,
          unfocusedIndicatorColor: colors.outline,
          cursorColor: colors.primary,
          focusedLabelColor: colors.primary,
          unfocusedLabelColor: colors.outline,
        }}
      >
        <OutlinedTextField.Label>
          <ThemedNativeText>{t("forms.customer.document_type.label")}</ThemedNativeText>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <ExposedDropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}
        containerColor={colors.surface}
      >
        {documentTypeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              field.handleChange(option.value);
              setExpanded(false);
            }}
          >
            <DropdownMenuItem.Text>
              <ThemedNativeText color={colors.onSurface}>{option.label}</ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </ExposedDropdownMenu>
    </ExposedDropdownMenuBox>
  );
}

export function DocumentNumberInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.customer.document_number.label"
      placeholder="forms.customer.document_number.placeholder"
      iconName="badge"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
    />
  );
}

export function PhoneInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.customer.phone.label"
      placeholder="forms.customer.phone.placeholder"
      iconName="call"
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

export function EmailInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      value={field.state.value}
      label="forms.customer.email.label"
      placeholder="forms.customer.email.placeholder"
      iconName="mail"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "email",
      }}
    />
  );
}

export function CreditLimitInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      value={field.state.value}
      label="forms.customer.credit_limit.label"
      placeholder="forms.customer.credit_limit.placeholder"
      iconName="attach-money"
      modifiers={[fillMaxWidth()]}
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
    />
  );
}

export const CustomerFormInputs = {
  NameInput,
  DocumentTypeInput,
  DocumentNumberInput,
  PhoneInput,
  EmailInput,
  CreditLimitInput,
};
