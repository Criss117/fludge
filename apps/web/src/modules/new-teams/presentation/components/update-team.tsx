import { toast } from "sonner";
import { createContext, use, useState, useTransition } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useMutateTeams } from "@/modules/new-teams/application/hooks/use-mutate-teams";
import type { Team } from "@/modules/new-teams/application/collections/teams.collections";

interface Context {
  selectedTeam: Team | null;
  selectTeam: (team: Team) => void;
  clearState: () => void;
}

const defaultValues: CreateTeamSchema = {
  name: "",
  permissions: [],
  description: "",
};

const UpdateTeamContext = createContext<Context | null>(null);

function useUpdateTeam() {
  const context = use(UpdateTeamContext);

  if (!context)
    throw new Error(
      "useUpdateTeamContext must be used within a UpdateTeamDialog",
    );

  return context;
}

function Root({ children }: { children: React.ReactNode }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  const clearState = () => {
    setSelectedTeam(null);
  };

  return (
    <UpdateTeamContext.Provider
      value={{ selectedTeam, selectTeam, clearState }}
    >
      {children}
    </UpdateTeamContext.Provider>
  );
}

function FormDialog() {
  const { update } = useMutateTeams();
  const { selectedTeam, clearState } = useUpdateTeam();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useTeamForm({
    validators: {
      onSubmit: createTeamSchema,
    },
    defaultValues: selectedTeam || defaultValues,
    onSubmit: ({ value, formApi }) => {
      if (!selectedTeam) return;

      update.mutate(
        {
          id: selectedTeam.id,
          ...value,
        },
        {
          onSuccess: () => {
            toast.success("Equipo actualizado exitosamente", {
              position: "top-center",
            });
            formApi.reset();
            clearState();
          },
          onError: (error) => {
            toast.error(error.message, {
              position: "top-center",
            });
            setRootError(error.message);
          },
        },
      );
    },
  });

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog
      open={!!selectedTeam}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          setRootError(null);
          clearState();
        }
      }}
    >
      <DialogContent className="min-w-2/3">
        <DialogHeader>
          <DialogTitle>Actualizar Equipo</DialogTitle>
          <DialogDescription>
            Modifica el nombre, descripción y permisos del equipo.
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
            <Button type="submit" disabled={update.isPending}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const UpdateTeam = {
  FormDialog,
  Root,
  useUpdateTeam,
};
