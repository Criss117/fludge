import {
  registerFormOptions,
  type OnRegisterSubmit,
} from "@fludge/client/application/iam/organization/form/register-organization-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
  id: string;
  isInvalid: boolean;
}

interface FieldProps<T> {
  children: (props: ChildrenProps<T>) => React.ReactNode;
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    NameField,
    PhoneField,
    LegalNameField,
    TaxIdField,
    AddressField,
  },
  formComponents: {},
});

function NameField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "register-organization-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

function PhoneField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "register-organization-form-phone";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

function LegalNameField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "register-organization-form-legalname";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({
    field,
    id,
    isInvalid,
  });
}

function TaxIdField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "register-organization-form-tax-id";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

function AddressField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "register-organization-form-address";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

export function useRegisterOrganizationForm(options: OnRegisterSubmit) {
  return useAppForm(registerFormOptions(options));
}
