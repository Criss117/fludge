import { TrashIcon } from "lucide-react";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
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
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import { tryCatch } from "@fludge/utils/try-catch";
import { toast } from "sonner";

interface Props {
  team: Team;
}

export function RemoveTeam({ team }: Props) {
  const teamsCollection = useTeamsCollection();

  const handleRemoveTeam = async () => {
    const tx = teamsCollection.delete(team.id);
    const loadingToastId = toast.loading("Eliminando equipo...", {
      position: "top-center",
    });

    const { error } = await tryCatch(tx.isPersisted.promise);

    toast.dismiss(loadingToastId);
    if (error) {
      toast.error(error.message, {
        position: "top-center",
      });
      return;
    }

    toast.success("Equipo eliminado exitosamente", {
      position: "top-center",
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
