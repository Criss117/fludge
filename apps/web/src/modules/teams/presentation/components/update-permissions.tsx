import { FileWarning, Save } from "lucide-react";
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
import { Button } from "@/modules/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/modules/shared/components/ui/tooltip";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import type { Permission } from "@fludge/utils/validators/permission.schemas";
import { useState, useTransition } from "react";
import { tryCatch } from "@fludge/utils/try-catch";
import { toast } from "sonner";
import { cn } from "@/modules/shared/lib/utils";

interface Props {
  permissions: Permission[];
  teamId: string;
  hasChanges: boolean;
}

export function UpdatePermissions({ permissions, hasChanges, teamId }: Props) {
  const [open, setIsOpen] = useState(false);
  const [isPending, startTransaction] = useTransition();
  const teamsCollection = useTeamsCollection();

  const handleSave = () => {
    const tx = teamsCollection.update(teamId, (draft) => {
      draft.permissions = permissions;
    });

    setIsOpen(false);
    startTransaction(async () => {
      const toastId = toast.loading("Guardando cambios...", {
        position: "top-center",
      });
      const { error } = await tryCatch(tx.isPersisted.promise);

      toast.dismiss(toastId);

      if (error) {
        toast.error("Error al guardar cambios", {
          position: "top-center",
        });
        return;
      }

      toast.success("Cambios guardados", {
        position: "top-center",
      });
    });
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
                  disabled={!hasChanges || isPending}
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
