import { BottomSheet, Button, Group, HStack, List, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  presentationDetents,
  presentationDragIndicator,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type { CustomerFormSchema } from "@fludge/client/commerce/forms/customer.form";
import type { MinimalField } from "@fludge/client/shared/field-api";
import { customerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
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

function NameInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.customer.name.label"
      placeholder="forms.customer.name.placeholder"
      iconName="person"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      defaultValue={field.state.value}
    />
  );
}

function DocumentTypeInput({ field }: FieldProps<DocumentTypeValue>) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [expanded, setExpanded] = useState(false);

  const selected = useMemo(
    () => documentTypeOptions.find((o) => o.value === field.state.value) ?? null,
    [field.state.value],
  );

  return (
    <VStack>
      <BottomSheet
        isPresented={expanded}
        onIsPresentedChange={setExpanded}
        anchor={
          <Button
            onPress={() => setExpanded(true)}
            modifiers={[
              buttonStyle("borderedProminent"),
              controlSize("large"),
              tint(colors.surfaceContainer),
            ]}
          >
            <HStack>
              <ThemedNativeText variant={selected === null ? "muted" : "base"}>
                {selected?.label ?? t("forms.customer.document_type.label")}
              </ThemedNativeText>
            </HStack>
          </Button>
        }
      >
        <Group
          modifiers={[
            presentationDetents(["medium", "large"]),
            presentationDragIndicator("visible"),
          ]}
        >
          <List>
            {documentTypeOptions.map((option) => (
              <Button
                key={option.value}
                onPress={() => {
                  field.handleChange(option.value);
                  setExpanded(false);
                }}
              >
                <HStack>
                  <ThemedNativeText>{option.label}</ThemedNativeText>
                  <Spacer />
                  {selected?.value === option.value && (
                    <Icon name="check" size={18} color={colors.primary} />
                  )}
                </HStack>
              </Button>
            ))}
          </List>
        </Group>
      </BottomSheet>
    </VStack>
  );
}

function DocumentNumberInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.customer.document_number.label"
      placeholder="forms.customer.document_number.placeholder"
      iconName="user-name"
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
      label="forms.customer.phone.label"
      placeholder="forms.customer.phone.placeholder"
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

function EmailInput({ field }: FieldProps<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      label="forms.customer.email.label"
      placeholder="forms.customer.email.placeholder"
      iconName="mail"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "email",
      }}
      defaultValue={field.state.value}
    />
  );
}

function CreditLimitInput({ field }: FieldProps<number>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <TextInput
      type="number"
      label="forms.customer.credit_limit.label"
      placeholder="forms.customer.credit_limit.placeholder"
      iconName="dollar"
      isError={isInvalid}
      onValueChange={field.handleChange}
      errors={field.state.meta.errors}
      keyboardOptions={{
        keyboardType: "number",
      }}
      defaultValue={field.state.value}
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
