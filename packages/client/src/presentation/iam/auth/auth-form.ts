import {
  signInFormOptions,
  signUpFormOptions,
  type OnSignInSubmit,
  type OnSignUpSubmit,
} from "@fludge/client/application/iam/auth/sign-in-form";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useState } from "react";

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

interface PasswordFieldProps {
  children: (
    props: ChildrenProps<string> & {
      showPassword: boolean;
      setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
    },
  ) => React.ReactNode;
}

function PasswordField({ children }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const field = useFieldContext<string>();
  const id = "auth-form-password";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return children({ field, id, isInvalid, showPassword, setShowPassword });
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
