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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/modules/shared/components/ui/alert-dialog";
import { Button } from "@/modules/shared/components/ui/button";
import type { Employee } from "@/modules/new-employees/application/collections/employees.collection";
import { useMutateTeamsMembers } from "../../application/hooks/use-mutate-teams-members";

interface Props {
  teamId: string;
  selectedEmployees: Employee[];
}

export function RemoveEmployeesFromTeam({ teamId, selectedEmployees }: Props) {
  const [open, setOpen] = useState(false);
  const { remove } = useMutateTeamsMembers();

  const handleRemoveEmployees = () => {
    const toasLoadingId = toast.loading("Eliminando empleados del equipo", {
      position: "top-center",
    });
    remove.mutate(
      selectedEmployees.map((employee) => ({
        teamId,
        userId: employee.user.id,
      })),
      {
        onSuccess: () => {
          toast.success("Empleados eliminados exitosamente", {
            position: "top-center",
          });
          setOpen(false);
        },
        onError: () => {
          toast.error("Error al eliminar empleados", {
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
            disabled={selectedEmployees.length === 0}
          />
        )}
      >
        <UserMinus />
        <span>Eliminar ({selectedEmployees.length}) empleados</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar ({selectedEmployees.length}) empleados de este equipo
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar estos empleados del equipo?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="px-5">
          {selectedEmployees.map((employee) => (
            <li key={employee.id} className="list-disc">
              <div className="flex items-center gap-x-1">
                <p>{employee.user.name}</p>
                <p className="text-muted-foreground text-sm">
                  ({employee.user.email})
                </p>
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
