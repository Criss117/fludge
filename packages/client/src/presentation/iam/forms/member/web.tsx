import { useMemo, useState } from "react";
import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@fludge/ui/components/field";
import { Button } from "@fludge/ui/components/button";
import { cn } from "@fludge/ui/lib/utils";
import { Input } from "@fludge/ui/components/input";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fludge/ui/components/card";
import { Separator } from "@fludge/ui/components/separator";
import { SearchInput } from "@fludge/ui/components/search-input";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useClipboard } from "../../hooks/use-clipboard";

// Charset for password generation. Ambiguous characters (I, l, 1, O, 0)
// are excluded so generated passwords stay readable.
const PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PASSWORD_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PASSWORD_DIGITS = "23456789";
const PASSWORD_SPECIALS = "!@#$%^&*";
const PASSWORD_ALL = PASSWORD_UPPER + PASSWORD_LOWER + PASSWORD_DIGITS + PASSWORD_SPECIALS;
const PASSWORD_LENGTH = 14;

function randomCharFrom(set: string): string {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return set.charAt(bytes[0]! % set.length);
}

/**
 * Generates a cryptographically secure password of `PASSWORD_LENGTH`
 * characters using `crypto.getRandomValues`. Guarantees at least one
 * uppercase, lowercase, digit, and special character, then shuffles so
 * the guaranteed chars never sit in predictable positions.
 */
function generatePassword(): string {
  const required = [
    randomCharFrom(PASSWORD_UPPER),
    randomCharFrom(PASSWORD_LOWER),
    randomCharFrom(PASSWORD_DIGITS),
    randomCharFrom(PASSWORD_SPECIALS),
  ];
  const restBytes = new Uint8Array(PASSWORD_LENGTH - required.length);
  crypto.getRandomValues(restBytes);
  const chars = [
    ...required,
    ...Array.from(restBytes, (b) => PASSWORD_ALL.charAt(b! % PASSWORD_ALL.length)),
  ];
  // Fisher-Yates shuffle with a crypto-random index per swap.
  for (let i = chars.length - 1; i > 0; i--) {
    const jBytes = new Uint8Array(1);
    crypto.getRandomValues(jBytes);
    const j = jBytes[0]! % (i + 1);
    const ci = chars[i]!;
    const cj = chars[j]!;
    chars[i] = cj;
    chars[j] = ci;
  }
  return chars.join("");
}

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    NameField,
    EmailField,
    PasswordField,
    PhoneField,
    SelectGroupField,
  },
  formComponents: {},
});

function NameField() {
  const field = useFieldContext<string>();
  const id = "member-form-name";
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
  const id = "member-form-email";
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
  const id = "member-form-password";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [showPassword, setShowPassword] = useState(false);
  const { copied, copyToClipboard } = useClipboard();

  const handleGenerate = () => {
    const password = generatePassword();
    // Replace any user-typed value with the generated password.
    field.handleChange(password);
    void copyToClipboard(password);
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Contraseña</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={field.name}
          type={showPassword ? "text" : "password"}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder="••••••"
          className="pr-14"
        />
        {copied ? (
          <span className="absolute -top-4 right-0 text-[10px] text-muted-foreground">
            ¡Copiado!
          </span>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-8 top-1/2 -translate-y-1/2"
          aria-label="Generar contraseña"
          onClick={handleGenerate}
        >
          <KeyRound />
        </Button>
      </div>
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PhoneField() {
  const field = useFieldContext<string>();
  const id = "member-form-phone";
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

interface SelectGroupFieldProps {
  groups: GroupSummary[];
}

function SelectGroupField({ groups }: SelectGroupFieldProps) {
  const [query, setQuery] = useState("");
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [groups, query]);

  const selectGroup = (groupId: string) => {
    field.setValue((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }
      return [...prev, groupId];
    });
  };

  const isSelected = (groupId: string) => field.state.value.includes(groupId);

  return (
    <Field data-invalid={isInvalid} className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <FieldLabel className="text-base">
            Seleccion de Grupos ({field.state.value.length} seleccionados)
          </FieldLabel>
          <FieldError errors={field.state.meta.errors} />
        </div>
        <FieldDescription>
          Seleccione los grupos a los que desea asignar permisos
        </FieldDescription>
      </div>
      <Separator />
      <div>
        <SearchInput
          value={query}
          onChange={(v) => setQuery(v)}
          placeholder="Buscar grupos"
        />
      </div>
      <div className="grid grid-cols-3 gap-4 w-full">
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            className={cn("cursor-pointer border border-transparent", {
              "border-foreground bg-accent/20": isSelected(group.id),
            })}
            onClick={() => selectGroup(group.id)}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description || "-"}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Field>
  );
}

export const useRegisterMemberForm = useAppForm;
