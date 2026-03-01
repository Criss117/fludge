import { useState } from "react";
import { toast } from "sonner";
import { FileWarning, Save } from "lucide-react";
import type { Permission } from "@fludge/utils/validators/permission.schemas";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shared/components/ui/tooltip";
import { cn } from "@shared/lib/utils";

import { useMutateTeams } from "@teams/application/hooks/use-mutate-teams";

interface Props {
  permissions: Permission[];
  teamId: string;
  hasChanges: boolean;
}

export function UpdatePermissions({ permissions, hasChanges, teamId }: Props) {
  const [open, setIsOpen] = useState(false);
  const { updatePermissions } = useMutateTeams();

  const handleSave = () => {
    const toastId = toast.loading("Guardando cambios...", {
      position: "top-center",
    });

    updatePermissions.mutate(
      {
        teamId,
        permissions,
      },
      {
        onSuccess: () => {
          toast.dismiss(toastId);
          toast.success("Cambios guardados", {
            position: "top-center",
          });
          setIsOpen(false);
        },
        onError: () => {
          toast.dismiss(toastId);
          toast.error("Error al guardar cambios", {
            position: "top-center",
          });
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={(props) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  {...props}
                  variant="default"
                  size="icon"
                  disabled={!hasChanges || updatePermissions.isPending}
                >
                  <Save />
                </Button>
              }
            />
            <TooltipContent>
              <p>Guardar cambios</p>
            </TooltipContent>
          </Tooltip>
        )}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex gap-x-2">
            {permissions.length === 0 && (
              <FileWarning className="text-destructive" />
            )}

            <AlertDialogTitle
              className={cn(permissions.length === 0 ? "text-destructive" : "")}
            >
              {permissions.length > 0
                ? "Modificar permisos"
                : "No puedes guardar los cambios"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription>
            {permissions.length > 0
              ? "Esta seguro de modificar los permisos del equipo?"
              : "Los equipos deben tener al menos un permiso."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {permissions.length > 0 && (
            <AlertDialogAction
              onClick={handleSave}
              disabled={permissions.length === 0}
            >
              Continuar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
