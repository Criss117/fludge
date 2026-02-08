import { Button } from "@/modules/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/modules/shared/components/ui/field";
import { Input } from "@/modules/shared/components/ui/input";
import { Separator } from "@/modules/shared/components/ui/separator";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { cn } from "@/modules/shared/lib/utils";
import {
  groupedPermissions,
  type Permission,
} from "@fludge/utils/validators/permission.schemas";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";

interface PermissionsFieldProps {
  className?: string;
}

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    NameField,
    DescriptionField,
    PermissionsField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

function NameField() {
  const field = useFieldContext<string>();
  const id = field.name + "-team-name";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre Del Equipo</FieldLabel>
      <Input
        id={id}
        type="text"
        placeholder="Ej: Administradores"
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function DescriptionField() {
  const field = useFieldContext<string>();
  const id = field.name + "-team-description";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Descripción Del Equipo</FieldLabel>
      <Textarea
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        className="resize-none"
        placeholder="Descripción del equipo"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function PermissionsField({ className }: PermissionsFieldProps) {
  const field = useFieldContext<Permission[]>();

  const { value: values, meta } = field.state;
  const isInvalid = meta.isTouched && !meta.isValid;

  const checkPermissions = useMemo(
    () => ({
      isSelected: (permission: Permission) => values.includes(permission),
      isGroupSelected: (permissions: Permission[]) =>
        permissions.every((permission) => values.includes(permission)),
      isSomeGroupSelected: (permissions: Permission[]) =>
        permissions.some((permission) => values.includes(permission)),
    }),
    [values],
  );

  const handleClickPermission = useCallback(
    (permission: Permission) => {
      const index = values.indexOf(permission);
      index !== -1 ? field.removeValue(index) : field.pushValue(permission);
    },
    [values, field],
  );

  const handleClickPermissions = useCallback(
    (permissions: Permission[]) => {
      const isAllSelected = checkPermissions.isGroupSelected(permissions);

      if (isAllSelected) {
        // Deseleccionar todos
        permissions.forEach((permission) => {
          const index = values.indexOf(permission);
          if (index !== -1) field.removeValue(index);
        });

        return;
      }
      // Seleccionar todos los que faltan
      permissions.forEach((permission) => {
        if (!values.includes(permission)) {
          field.pushValue(permission);
        }
      });
    },
    [values, field, checkPermissions],
  );

  const getGroupState = useCallback(
    (permissions: Permission[]) => {
      const isAll = checkPermissions.isGroupSelected(permissions);
      const isSome = checkPermissions.isSomeGroupSelected(permissions);

      return {
        checked: isAll,
        indeterminate: !isAll && isSome,
      };
    },
    [checkPermissions],
  );

  return (
    <Field data-invalid={isInvalid}>
      {isInvalid && <FieldError errors={meta.errors} />}

      <div className={cn("space-y-4", className)}>
        {Object.values(groupedPermissions).map((group) => {
          const groupPermissions = group.values.map((v) => v.en);
          const groupState = getGroupState(groupPermissions);

          return (
            <Card key={group.en} className="py-2 gap-2">
              <CardHeader className="px-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {group.es}
                </CardTitle>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="justify-start items-center gap-x-2"
                  onClick={() => handleClickPermissions(groupPermissions)}
                  aria-label={`Seleccionar todos los permisos de ${group.es}`}
                >
                  <Checkbox
                    id={`select-all-${group.en}`}
                    checked={groupState.checked}
                    indeterminate={groupState.indeterminate}
                    className="size-3"
                    readOnly
                    tabIndex={-1}
                  />
                  <span className="text-xs">Seleccionar Todos</span>
                </Button>
              </CardHeader>

              <Separator />

              <CardContent className="px-3 grid grid-cols-2 gap-2">
                {group.values.map((permission) => (
                  <Button
                    key={permission.en}
                    type="button"
                    onClick={() => handleClickPermission(permission.en)}
                    variant="outline"
                    className="justify-start items-center gap-2 h-auto py-2"
                  >
                    <Checkbox
                      id={permission.en}
                      checked={checkPermissions.isSelected(permission.en)}
                      readOnly
                      tabIndex={-1}
                      className="shrink-0"
                    />
                    <span className="text-sm font-normal">{permission.es}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Field>
  );
}

export const useTeamForm = useAppForm;
