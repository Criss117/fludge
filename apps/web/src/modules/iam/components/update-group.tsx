import { useId } from "react";

import {
  createResourceFormContext,
  useResourceFormState,
} from "@fludge/client/presentation/shared/context/resourse-form.context";
import { Button } from "@fludge/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@fludge/ui/components/sheet";
import { Separator } from "@fludge/ui/components/separator";
import { useGroupForm } from "@fludge/client/presentation/iam/forms/group/web";
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import {
  type GroupFormDefaultValues,
  useUpdateGroupFormOptions,
} from "@fludge/client/application/iam/forms/group.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";

const { Context: GroupsFormContext, useResourceForm } =
  createResourceFormContext<GroupFormDefaultValues>();

export const useUpdateGroupForm = useResourceForm;

export function UpdateGroupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const formState = useResourceFormState<GroupFormDefaultValues>();

  return (
    <GroupsFormContext.Provider value={formState}>
      {children}
    </GroupsFormContext.Provider>
  );
}

interface Props {
  organizationId: string;
}

export function UpdateGroup({ organizationId }: Props) {
  const { close, data, isOpen } = useUpdateGroupForm();
  const createGroupFormOptions = useUpdateGroupFormOptions({
    organizationId,
    defaultValues: {
      groupId: data?.groupId ?? "",
      name: data?.name ?? "",
      description: data?.description ?? "",
      permissions: data?.permissions ?? [],
    },
    onSuccess: () => close(),
  });
  const form = useGroupForm(createGroupFormOptions);

  const formId = `create-group-form-${useId()}`;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          close();
        }
      }}
    >
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Crear Nuevo Grupo</SheetTitle>
          <SheetDescription>
            Crear un grupo de permisos que se pueda asignar a los empleados.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 no-scrollbar overflow-y-auto space-y-8">
          <form
            id={formId}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldLegend>Información del Grupo</FieldLegend>
              <FieldGroup>
                <form.AppField name="name">
                  {(field) => <field.NameField />}
                </form.AppField>
                <form.AppField name="description">
                  {(field) => <field.DescriptionField />}
                </form.AppField>
              </FieldGroup>
              <FieldGroup>
                <form.AppField name="permissions">
                  {(field) => <field.PermissionsField />}
                </form.AppField>
              </FieldGroup>
            </FieldSet>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Resumen de los datos ingresados</CardDescription>
            </CardHeader>
            <CardContent>
              <form.Subscribe selector={(s) => s.values.name}>
                {(name) => <p className="text-sm">Nombre: {name || "-"}</p>}
              </form.Subscribe>
              <form.Subscribe selector={(s) => s.values.description}>
                {(description) => (
                  <p className="text-sm">Descripción: {description || "-"}</p>
                )}
              </form.Subscribe>
              <form.Subscribe selector={(s) => s.values.permissions}>
                {(permissions) => (
                  <p className="text-sm">Permisos: {permissions.join(", ")}</p>
                )}
              </form.Subscribe>
            </CardContent>
          </Card>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Guardar Cambios
          </Button>
          <SheetClose
            render={(props) => (
              <Button
                {...props}
                onClick={(e) => {
                  props.onClick?.(e);
                  form.reset();
                }}
                variant="outline"
              />
            )}
          >
            <span>Cancelar</span>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
