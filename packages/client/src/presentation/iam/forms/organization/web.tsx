import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@fludge/ui/components/field";
import { Input } from "@fludge/ui/components/input";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

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

function NameField() {
  const field = useFieldContext<string>();
  const id = "organization-form-name";
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
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        placeholder="EJ: Mi Organización"
      />
      {isInvalid ? <FieldError id={`${id}-error`} errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PhoneField() {
  const field = useFieldContext<string>();
  const id = "organization-form-phone";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Número de teléfono</FieldLabel>
      <Input
        id={id}
        name={field.name}
        type="tel"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        placeholder="EJ: 325-123-4567"
      />
      {isInvalid ? <FieldError id={`${id}-error`} errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function LegalNameField() {
  const field = useFieldContext<string>();
  const id = "organization-form-legal-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Razón social</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        placeholder="EJ: Mi Organización S.A."
      />
      {isInvalid ? <FieldError id={`${id}-error`} errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function TaxIdField() {
  const field = useFieldContext<string>();
  const id = "organization-form-tax-id";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>NIT</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        placeholder="EJ: 900123456-1"
      />
      {isInvalid ? <FieldError id={`${id}-error`} errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function AddressField() {
  const field = useFieldContext<string>();
  const id = "organization-form-address";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Dirección</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        placeholder="EJ: Calle 123 #45-67"
      />
      {isInvalid ? <FieldError id={`${id}-error`} errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

export const useRegisterOrganizationForm = useAppForm;