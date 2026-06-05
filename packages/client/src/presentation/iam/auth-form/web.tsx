import type { FieldInput } from "@fludge/client/application/iam/auth-form";
import { Field, FieldError, FieldLabel } from "@fludge/ui/components/field";
import { Input } from "@fludge/ui/components/input";

export function NameField({ field, id, isInvalid }: FieldInput<string>) {
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

export function EmailField({ field, id, isInvalid }: FieldInput<string>) {
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

export function PasswordField({ field, id, isInvalid }: FieldInput<string>) {
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

export function PhoneField({ field, id, isInvalid }: FieldInput<string>) {
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
