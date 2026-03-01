import { toast } from "sonner";
import { useState } from "react";
import { PlusIcon, Shield } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/components/ui/dialog";
import {
  createTeamSchema,
  type CreateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@shared/components/ui/field";
import { ScrollArea } from "@shared/components/ui/scroll-area";
import { Button } from "@shared/components/ui/button";
import { Separator } from "@shared/components/ui/separator";

import { useTeamForm } from "./team-form";
import { useMutateTeams } from "@teams/application/hooks/use-mutate-teams";

const defaultValues: CreateTeamSchema = {
  name: "",
  permissions: [],
  description: "",
};

export function CreateTeam() {
  const [open, setOpen] = useState(false);
  const { create } = useMutateTeams();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useTeamForm({
    validators: {
      onChange: createTeamSchema,
    },
    defaultValues,
    onSubmit: ({ value, formApi }) => {
      const loadingToastId = toast.loading("Creando equipo...", {
        position: "top-center",
      });
      create.mutate(value, {
        onSuccess: () => {
          toast.dismiss(loadingToastId);
          toast.success("Equipo creado exitosamente", {
            position: "top-center",
          });
          formApi.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.dismiss(loadingToastId);
          setRootError(error.message);
        },
      });
    },
  });

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setRootError(null);
          form.reset();
        }
        setOpen(v);
      }}
    >
      <DialogTrigger render={(props) => <Button {...props} />}>
        <PlusIcon />
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
            <Button type="submit" disabled={create.isPending}>
              Guardar Equipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
