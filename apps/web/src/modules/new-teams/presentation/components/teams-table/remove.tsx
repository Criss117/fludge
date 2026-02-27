import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/modules/shared/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/modules/shared/components/ui/dropdown-menu";
import { useMutateTeams } from "@/modules/new-teams/application/hooks/use-mutate-teams";
import type { Team } from "@/modules/new-teams/application/collections/teams.collections";

interface Props {
  team: Team;
}

export function RemoveTeam({ team }: Props) {
  const { remove } = useMutateTeams();

  const handleRemoveTeam = () => {
    const loadingToastId = toast.loading(`Eliminando equipo ${team.name}`, {
      position: "top-center",
    });

    remove.mutate(team.id, {
      onSuccess: () => {
        toast.success("Equipo eliminado exitosamente", {
          position: "top-center",
        });
      },
      onError: (error) => {
        toast.error(error.message, {
          position: "top-center",
        });
      },
      onSettled: () => {
        console.log(loadingToastId);
        toast.dismiss(loadingToastId);
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <DropdownMenuItem
            className="group gap-2 text-destructive group-focus:text-destructive"
            closeOnClick={false}
          >
            <TrashIcon className="h-4 w-4 group-focus:text-destructive" />
            Eliminar equipo
          </DropdownMenuItem>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Esta completamente seguro de eliminar {team.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu
            equipo de nuestros servidores.
          </AlertDialogDescription>
          <AlertDialogDescription>
            Los empleados que pertenecen a este equipo serán desvinculados y
            perderán los permisos del equipo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleRemoveTeam}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
