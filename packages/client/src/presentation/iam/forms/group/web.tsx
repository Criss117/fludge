import { CopyCheck } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@fludge/ui/components/field";
import { Input } from "@fludge/ui/components/input";
import { Textarea } from "@fludge/ui/components/textarea";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fludge/ui/components/accordion";
import {
  PERMISSIONS,
  RESOURCE_DESCRIPTIONS,
  type Permission,
  type Resource,
} from "@fludge/utils/permissions/data";
import { Checkbox } from "@fludge/ui/components/checkbox";
import {
  ALL_PERMISSIONS,
  getPermissionByResource,
  getPermissionDescription,
  hasAllPermissions,
} from "@fludge/utils/permissions/index";
import { Label } from "@fludge/ui/components/label";
import { Button } from "@fludge/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fludge/ui/components/tooltip";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { NameField, DescriptionField, PermissionsField },
  formComponents: {},
});

function NameField() {
  const field = useFieldContext<string>();
  const id = "group-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre del Grupo</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Administradores"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function DescriptionField() {
  const field = useFieldContext<string>();
  const id = "group-form-description";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Descripción del Grupo (Opcional)</FieldLabel>
      <Textarea
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="Descripción del grupo"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PermissionsField() {
  const field = useFieldContext<Permission[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const checkAll = () => {
    field.setValue((prev) =>
      prev.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS,
    );
  };

  const checkAllByResource = (resource: Resource) => {
    const permissions = getPermissionByResource(resource);

    field.setValue((prev) => {
      if (hasAllPermissions(prev, permissions))
        return prev.filter((p) => !p.includes(resource));

      const withoutResource = prev.filter((p) => !p.includes(resource));

      return [...withoutResource, ...permissions];
    });
  };

  const isAllCheckedByResource = (resource: Resource) => {
    const permissions = getPermissionByResource(resource);
    return hasAllPermissions(field.state.value, permissions);
  };

  const isChecked = (permission: Permission) => {
    return field.state.value.includes(permission);
  };

  const togglePermission = (permission: Permission) => {
    field.setValue((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      }

      return [...prev, permission];
    });
  };

  const totalPermissionsCheckedByResource = (resource: Resource) => {
    const permissions = getPermissionByResource(resource);
    return field.state.value.filter((p) => permissions.includes(p)).length;
  };

  return (
    <Field data-invalid={isInvalid}>
      <div className="flex justify-between">
        <div>
          <FieldLabel className="text-xl">Permisos</FieldLabel>
          <FieldDescription>
            Seleccione los permisos que desea asignar al grupo
          </FieldDescription>
          <FieldError errors={field.state.meta.errors} />
        </div>
        <div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button size="icon" variant="outline" onClick={checkAll}>
                  <CopyCheck />
                </Button>
              }
            />
            <TooltipContent>
              <p>Seleccionar todos los permisos</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Accordion multiple className="border" defaultValue={["groups"]}>
        {Object.entries(PERMISSIONS).map(([resource, actions]) => {
          const checkAllKey = `${resource}:check-all` as Permission;
          const resourceDesc = RESOURCE_DESCRIPTIONS[resource as Resource];
          const totalChecked = totalPermissionsCheckedByResource(
            resource as Resource,
          );
          return (
            <AccordionItem
              value={resource}
              key={resource}
              className="border-b last:border-b-0 mt-2"
            >
              <AccordionTrigger className="text-base bg-accent px-4 gap-x-4 items-center">
                <span>{resourceDesc}</span>
                <span className="text-muted-foreground text-sm">
                  ({totalChecked}) Permisos Seleccionados
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div
                  key={checkAllKey}
                  className="flex gap-x-4 items-center py-2"
                >
                  <Checkbox
                    id={checkAllKey}
                    name={checkAllKey}
                    className="size-5 cursor-pointer"
                    onCheckedChange={() =>
                      checkAllByResource(resource as Resource)
                    }
                    checked={isAllCheckedByResource(resource as Resource)}
                  />
                  <div>
                    <Label
                      className="text-base cursor-pointer"
                      htmlFor={checkAllKey}
                    >
                      Seleccionar todos los permisos de {resourceDesc}
                    </Label>
                  </div>
                </div>
                {Object.values(actions).map((permission) => {
                  const permissionKey =
                    `${resource}:${permission}` as Permission;
                  const permissionDesc =
                    getPermissionDescription(permissionKey);

                  return (
                    <div
                      key={permissionKey}
                      className="flex gap-x-4 items-center py-2"
                    >
                      <Checkbox
                        id={permissionKey}
                        name={permissionKey}
                        className="size-5 cursor-pointer"
                        onCheckedChange={() => togglePermission(permissionKey)}
                        checked={isChecked(permissionKey)}
                      />
                      <div>
                        <Label
                          className="text-base cursor-pointer"
                          htmlFor={permissionKey}
                        >
                          {permissionDesc.title}
                        </Label>
                        <Label
                          className="text-muted-foreground cursor-pointer"
                          htmlFor={permissionKey}
                        >
                          {permissionDesc.description}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Field>
  );
}

export const useGroupForm = useAppForm;
