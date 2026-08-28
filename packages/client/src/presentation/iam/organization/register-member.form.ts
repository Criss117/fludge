import {
  registerFormOptions,
  type OnRegisterMemberSubmit,
} from "@fludge/client/application/iam/organization/form/register-member-form";
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

function EmailField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  return children({
    field,
    id: "register-member-form-email",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

function PasswordField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  return children({
    field,
    id: "register-member-form-password",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

function PhoneField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  return children({
    field,
    id: "register-member-form-phone",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

function NameField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  return children({
    field,
    id: "register-member-form-name",
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
  });
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { EmailField, PasswordField, PhoneField, NameField },
  formComponents: {},
});

export function useRegisterMemberForm(options: OnRegisterMemberSubmit) {
  return useAppForm(registerFormOptions(options));
}
