import { useState } from "react";
import {
  EyeClosed,
  EyeIcon,
  IdCard,
  LockIcon,
  MailIcon,
  Map,
  Phone,
  ScrollText,
} from "lucide-react";
import { LinkButton } from "@/modules/shared/components/link-button";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/modules/shared/components/ui/field";
import { Input } from "@/modules/shared/components/ui/input";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { cn } from "@/modules/shared/lib/utils";

interface PasswordProps {
  hideForgotPassword?: boolean;
  label?: string;
  placeholder?: string;
}

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    EmailField,
    PasswordField,
    NameField,
    UsernameField,
    PhoneField,
    CCField,
    AddressField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

function NameField() {
  const field = useFieldContext<string>();
  const id = field.name + "-name";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Nombre completo
        <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex relative">
        <ScrollText
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={20}
        />
        <Input
          className="pl-10"
          id={id}
          type="text"
          placeholder="Ej: John Doe"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function UsernameField() {
  const field = useFieldContext<string>();
  const id = field.name + "-username";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Nombre de usuario
        <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex relative">
        <ScrollText
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={20}
        />
        <Input
          className="pl-10"
          id={id}
          type="text"
          placeholder="Ej: jhondoe"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function EmailField() {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name + "-email"}>
        Email
        <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex relative">
        <MailIcon
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={20}
        />
        <Input
          className="pl-10"
          id={field.name + "-email"}
          type="email"
          placeholder="micorreo@gmail.com"
          autoComplete="email"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function PasswordField({
  hideForgotPassword = false,
  label = "Contraseña",
  placeholder = "********",
}: PasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field
      className={cn(!hideForgotPassword && "gap-0")}
      data-invalid={isInvalid}
    >
      <div className="flex justify-between">
        <FieldLabel htmlFor={field.name + "-password"}>
          {label}
          <span className="text-destructive">*</span>
        </FieldLabel>
        {!hideForgotPassword && (
          <LinkButton variant="link" to="/auth/forgot-password">
            Olvidaste tu contraseña?
          </LinkButton>
        )}
      </div>
      <div className="flex relative">
        <LockIcon
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={20}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword((pre) => !pre)}
        >
          {showPassword ? <EyeClosed size={20} /> : <EyeIcon size={20} />}
        </Button>

        <Input
          id={field.name + "-password"}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="current-password"
          className="pl-10"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className="pt-2" />
      )}
    </Field>
  );
}

function PhoneField() {
  const field = useFieldContext<string>();
  const id = field.name + "-phone";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Numero telefonico</FieldLabel>
      <div className="flex relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
        <Input
          className="pl-10"
          id={id}
          type="number"
          placeholder="Ej: 3238439347"
          name={field.name}
          value={
            field.state.value.toString() === "0"
              ? ""
              : field.state.value.toString()
          }
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function CCField() {
  const field = useFieldContext<string>();
  const id = field.name + "-cc";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Numero de identificacion
        <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex relative">
        <IdCard
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={20}
        />
        <Input
          className="pl-10"
          id={id}
          type="text"
          placeholder="Ej: 13234341443"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function AddressField() {
  const field = useFieldContext<string>();
  const id = field.name + "-cc";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Direccion
        <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex relative">
        <Map className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
        <Input
          className="pl-10"
          id={id}
          type="text"
          placeholder="Ej: Calle Principal 123"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          required
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export const useAuthForm = useAppForm;
