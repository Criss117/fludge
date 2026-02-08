import { PlusCircle, Shield } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";
import { Separator } from "@/modules/shared/components/ui/separator";
import { useTeamForm } from "./team-form";
import {
  createTeamSchema,
  type CreateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@/modules/shared/components/ui/field";
import { ScrollArea } from "@/modules/shared/components/ui/scroll-area";
import { teamsCollection } from "../../application/collections/teams.collection";
import { tryCatch } from "@fludge/utils/try-catch";
import { toast } from "sonner";
import { useState } from "react";

const defaultValues: CreateTeamSchema = {
  name: "",
  permissions: [],
};

interface Props {
  activeOrganizationId: string;
}

export function CreateTeamDialog({ activeOrganizationId }: Props) {
  const [open, setOpen] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useTeamForm({
    validators: {
      onSubmit: createTeamSchema,
    },
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const tx = teamsCollection.insert({
        name: value.name,
        permissions: value.permissions,
        description: value.description,
        organizationId: activeOrganizationId,
        createdAt: new Date(),
        id: Math.random().toString(36).substring(2, 9),
        isPending: true,
      });

      const { error } = await tryCatch(tx.isPersisted.promise);

      if (error) {
        toast.error(error.message);
        setRootError(error.message);
        return;
      }

      formApi.reset();
      setOpen(false);
    },
  });

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props) => <Button {...props} />}>
        <PlusCircle />
        <span>Crear Equipo</span>
      </DialogTrigger>
      <DialogContent className="min-w-2/3">
        <DialogHeader>
          <DialogTitle>Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Define el nombre, descripción y permisos del equipo.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {rootError && (
            <div className="p-4 bg-destructive text-white rounded-md">
              {rootError}
            </div>
          )}
          <form.AppField
            name="name"
            children={(field) => <field.NameField />}
          />

          <form.AppField
            name="description"
            children={(field) => <field.DescriptionField />}
          />

          <FieldSet className="gap-2">
            <FieldLegend className="flex items-center gap-x-1">
              <Shield size={18} />
              <span>Asignación de Permisos</span>
            </FieldLegend>
            <FieldDescription>
              Seleccione los permisos del equipo, los empleados asignados
              obtendrán estos permisos.
            </FieldDescription>

            <ScrollArea className="h-60">
              <form.AppField
                name="permissions"
                children={(field) => (
                  <field.PermissionsField className="grid lg:grid-cols-2 gap-3" />
                )}
              />
            </ScrollArea>
          </FieldSet>

          <DialogFooter>
            <DialogClose
              render={(props) => <Button {...props} variant="secondary" />}
            >
              Cancelar
            </DialogClose>
            <Button type="submit">Guardar Equipo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
