import { useState } from "react";
import { UserMinus } from "lucide-react";
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
} from "@shared/components/ui/alert-dialog";
import { Button } from "@shared/components/ui/button";

import { useMutateTeamsMembers } from "@teams/application/hooks/use-mutate-teams-members";
import type { Team } from "@teams/application/collections/teams.collections";

interface Props {
  userId: string;
  selectedTeams: Team[];
}

export function RemoveTeamsFromEmployee({ userId, selectedTeams }: Props) {
  const [open, setOpen] = useState(false);
  const { remove } = useMutateTeamsMembers();

  const handleRemoveEmployees = () => {
    const toasLoadingId = toast.loading("ELiminar equipos del empleado", {
      position: "top-center",
    });
    remove.mutate(
      selectedTeams.map((t) => ({
        teamId: t.id,
        userId,
      })),
      {
        onSuccess: () => {
          toast.success("Equipos eliminados exitosamente", {
            position: "top-center",
          });
          setOpen(false);
        },
        onError: () => {
          toast.error("Error al eliminar equipos", {
            position: "top-center",
          });
        },
        onSettled: () => {
          toast.dismiss(toasLoadingId);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            disabled={selectedTeams.length === 0}
          />
        )}
      >
        <UserMinus />
        <span>Eliminar ({selectedTeams.length}) equipos</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar ({selectedTeams.length}) equipos
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar estos equipos?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="px-5">
          {selectedTeams.map((t) => (
            <li key={t.id} className="list-disc">
              <div className="flex items-center gap-x-1">
                <p>{t.name}</p>
              </div>
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveEmployees}
            disabled={remove.isPending}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
