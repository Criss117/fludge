import { useMemo, useState } from "react";
import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@fludge/ui/components/field";
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
