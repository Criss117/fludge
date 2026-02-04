import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { slugify } from "@fludge/utils/slugify";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/modules/shared/components/ui/field";
import { Input } from "@/modules/shared/components/ui/input";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    OrganizationName,
    OrganizationLegalName,
    OrganizationAddress,
    OrganizationContactEmail,
    OrganizationContactPhone,
    OrganizationSlug,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

function OrganizationSlug() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-slug";

  return (
    <Field>
      <FieldLabel htmlFor={id}>URL de la tienda</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={slugify(field.state.value)}
        placeholder="EJ: Mi Tienda Retail"
        disabled
      />
    </Field>
  );
}

function OrganizationName() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-name";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre de la Organización</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Mi Tienda Retail"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function OrganizationLegalName() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-legal-name";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre legal de la Organización</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Mi Tienda Retail S.A."
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function OrganizationAddress() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-address";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Dirección de la Organización</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Calle Principal, Ciudad, País"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function OrganizationContactEmail() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-email";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Correo Electrónico de la Organización
      </FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: correo@ejemplo.com"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function OrganizationContactPhone() {
  const field = useFieldContext<string>();
  const id = field.name + "-org-phone";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Teléfono de la Organización</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: +57 312 123 4567"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export const useRegisterOrganizationForm = useAppForm;
