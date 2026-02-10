import { toast } from "sonner";
import { createContext, use, useState, useTransition } from "react";
import { PlusIcon, Shield } from "lucide-react";
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
import { tryCatch } from "@fludge/utils/try-catch";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";

interface Context {
  selectedTeam: Team | null;
  selectTeam: (team: Team) => void;
  clearState: () => void;
}

const defaultValues: CreateTeamSchema = {
  name: "",
  permissions: [],
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
  const {
    data: { activeOrganizationId },
  } = useVerifiedSession();
  const { selectedTeam, clearState } = useUpdateTeam();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);
  const teamsCollection = useTeamsCollection();

  const form = useTeamForm({
    validators: {
      onSubmit: createTeamSchema,
    },
    defaultValues: selectedTeam || defaultValues,
    onSubmit: ({ value, formApi }) => {
      if (!selectedTeam) return;

      const tx = teamsCollection.update(selectedTeam.id, (draft) => {
        draft.id = selectedTeam.id;
        draft.name = value.name;
        draft.permissions = value.permissions;
        draft.description = value.description;
        draft.isPending = true;
      });
      startTransition(async () => {
        const loadingToastId = toast.loading("Actualizando equipo...", {
          position: "top-center",
        });
        const { error } = await tryCatch(tx.isPersisted.promise);

        toast.dismiss(loadingToastId);
        if (error) {
          toast.error(error.message, {
            position: "top-center",
          });
          setRootError(error.message);
          return;
        }

        toast.success("Equipo actualizado exitosamente", {
          position: "top-center",
        });
        formApi.reset();
        clearState();
      });
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
            <Button type="submit" disabled={isPending}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const UpdateTeamDialog = {
  FormDialog,
  Root,
  useUpdateTeam,
};
