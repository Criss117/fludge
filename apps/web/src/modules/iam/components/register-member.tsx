import { useId, useState } from "react";
import { useRegisterMemberFormOptions } from "@fludge/client/application/iam/forms/member.form";
import { useRegisterMemberForm } from "@fludge/client/presentation/iam/forms/member/web";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fludge/ui/components/sheet";
import { PlusIcon } from "lucide-react";
import { Button } from "@fludge/ui/components/button";
import { Separator } from "@fludge/ui/components/separator";
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { useFindAllGroups } from "@fludge/client/application/iam/hooks/use-find-groups";

interface Props {
  organizationId: string;
}

export function RegisterMember({ organizationId }: Props) {
  const [open, setOpen] = useState(false);
  const registerMemberFormOptions = useRegisterMemberFormOptions({
    organizationId,
  });

  const { data: groups } = useFindAllGroups(organizationId);

  const form = useRegisterMemberForm(registerMemberFormOptions);

  const formId = `register-member-form-${useId()}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={(props) => <Button {...props} />}>
        <PlusIcon />
        <span>Registrar Miembro</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:min-w-[50dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Registrar Nuevo Miembro</SheetTitle>
          <SheetDescription>
            Registra un nuevo miembro en la organización.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 no-scrollbar overflow-y-auto space-y-8">
          <form
            id={formId}
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldLegend>Información del Miembro</FieldLegend>
              <FieldGroup className="flex flex-row">
                <form.AppField name="name">
                  {(field) => <field.NameField />}
                </form.AppField>
                <form.AppField name="phone">
                  {(field) => <field.PhoneField />}
                </form.AppField>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Información de Sesión</FieldLegend>
              <FieldGroup className="flex flex-row">
                <form.AppField name="email">
                  {(field) => <field.EmailField />}
                </form.AppField>
                <form.AppField name="password">
                  {(field) => <field.PasswordField />}
                </form.AppField>
              </FieldGroup>
            </FieldSet>

            <form.AppField name="groupIds">
              {(field) => <field.SelectGroupField groups={groups} />}
            </form.AppField>
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
            </CardContent>
          </Card>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Registrar Miembro
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
