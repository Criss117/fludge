import {
  signInFormOptions,
  signUpFormOptions,
  type OnSignInSubmit,
  type OnSignUpSubmit,
} from "@fludge/client/application/iam/forms/auth.form";
import { Field, FieldError, FieldLabel } from "@fludge/ui/components/field";
import { Input } from "@fludge/ui/components/input";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { NameField, EmailField, PasswordField, PhoneField },
  formComponents: {},
});

function NameField() {
  const field = useFieldContext<string>();
  const id = "auth-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Natalia"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function EmailField() {
  const field = useFieldContext<string>();
  const id = "auth-form-email";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Email</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="correo@fludge.dev"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PasswordField() {
  const field = useFieldContext<string>();
  const id = "auth-form-password";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Contraseña</FieldLabel>
      <Input
        id={id}
        name={field.name}
        type="password"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="••••••"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PhoneField() {
  const field = useFieldContext<string>();
  const id = "auth-form-phone";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Número de teléfono</FieldLabel>
      <Input
        id={id}
        name={field.name}
        type="number"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: 325-123-4567"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

export function useSignUpForm(options: OnSignUpSubmit) {
  return useAppForm(signUpFormOptions(options));
}

export function useSignInForm(options: OnSignInSubmit) {
  return useAppForm(signInFormOptions(options));
}
