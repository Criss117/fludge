import {
  signInFormOptions,
  signUpFormOptions,
  type OnSignInSubmit,
  type OnSignUpSubmit,
} from "@fludge/client/application/iam/auth/form/sign-in-form";

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
  fieldComponents: { NameField, EmailField, PasswordField, PhoneField },
  formComponents: {},
});

function NameField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "auth-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

function EmailField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "auth-form-email";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({
    field,
    id,
    isInvalid,
  });
}

function PasswordField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "auth-form-password";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

function PhoneField({ children }: FieldProps<string>) {
  const field = useFieldContext<string>();
  const id = "auth-form-phone";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid });
}

export function useSignUpForm(options: OnSignUpSubmit) {
  return useAppForm(signUpFormOptions(options));
}

export function useSignInForm(options: OnSignInSubmit) {
  return useAppForm(signInFormOptions(options));
}
