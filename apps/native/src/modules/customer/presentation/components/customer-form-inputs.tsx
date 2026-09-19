import { CommonInputs } from "@/modules/shared/components/common-inputs";
import { Select } from "heroui-native/select";
import { Typography } from "heroui-native/text";
import { FieldError } from "@/modules/shared/components/field-error";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { CustomerFormSchema } from "@fludge/client/application/customer/form/customer-form";
import { customerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";

interface FieldProps<T> {
  field: MinimalField<T>;
}

type DocumentTypeValue = CustomerFormSchema["documentType"];

const documentTypeOptions: Array<{
  label: string;
  value: DocumentTypeValue;
}> = customerDocumentTypeEnum.map((value) => ({
  label: value,
  value,
}));

function Name({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isRequired
      isInvalid={isInvalid}
      icon="person"
      errors={errors}
      label="forms.customer.name.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.customer.name.placeholder",
      }}
    />
  );
}

function DocumentType({
  field,
}: FieldProps<CustomerFormSchema["documentType"]>) {
  const { t } = useTranslation();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const selected = documentTypeOptions.find(
    (o) => o.value === field.state.value
  );

  return (
    <TextField isInvalid={isInvalid}>
      <Label>{t("forms.customer.document_type.label")}</Label>
      <Select
        presentation="dialog"
        value={selected}
        onValueChange={(option) => {
          const value = documentTypeOptions.find(
            (o) => o.value === option?.value
          );
          field.handleChange(value?.value ?? "");
        }}
      >
        <Select.Trigger className="bg-default h-12">
          {selected ? (
            <Typography maxFontSizeMultiplier={1}>{selected.label}</Typography>
          ) : (
            <Typography className="text-muted" maxFontSizeMultiplier={1}>
              {t("forms.customer.document_type.label")}
            </Typography>
          )}
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay className="bg-black/50" />
          <Select.Content presentation="dialog">
            {documentTypeOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                label={option.label}
              >
                <Typography className="flex-1" maxFontSizeMultiplier={1}>
                  {option.label}
                </Typography>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </TextField>
  );
}

function DocumentNumber({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="badge"
      errors={errors}
      label="forms.customer.document_number.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.customer.document_number.placeholder",
      }}
    />
  );
}

function Phone({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="phone"
      errors={errors}
      label="forms.customer.phone.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.customer.phone.placeholder",
      }}
    />
  );
}

function Email({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.TextInput
      isInvalid={isInvalid}
      icon="email"
      errors={errors}
      label="forms.customer.email.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.customer.email.placeholder",
        keyboardType: "email-address",
        autoCapitalize: "none",
      }}
    />
  );
}

function CreditLimit({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <CommonInputs.NumberInput
      isRequired
      isInvalid={isInvalid}
      errors={errors}
      icon="attach-money"
      label="forms.customer.credit_limit.label"
      inputProps={{
        value: field.state.value,
        onBlur: field.handleBlur,
        onChangeText: field.handleChange,
        placeholder: "forms.customer.credit_limit.placeholder",
      }}
    />
  );
}

// react-doctor-disable-next-line only-export-components -- This component namespace is the public form-input composition API.
export const CustomerFormInputs = {
  Name,
  DocumentType,
  DocumentNumber,
  Phone,
  Email,
  CreditLimit,
};
