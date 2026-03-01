import { toast } from "sonner";
import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { toAvatarFallback } from "@fludge/utils/helpers";

import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
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
import { Avatar, AvatarFallback } from "@shared/components/ui/avatar";
import { SearchInput } from "@shared/components/search-input";

import { useMutateTeamsMembers } from "@teams/application/hooks/use-mutate-teams-members";

import { useFindAllEmployeesByTeam } from "@employees/application/hooks/use-employees-queries";
import type { Employee } from "@employees/application/collections/employees.collection";

interface Props {
  teamId: string;
}

export function AssignEmployeeToTeam({ teamId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { create } = useMutateTeamsMembers();

  const employees = useFindAllEmployeesByTeam({
    teamId,
    inside: false,
    filters: {
      email: searchQuery,
      name: searchQuery,
    },
  });

  const selectEmployee = (employee: Employee) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(employee.user.id)) {
        return prev.filter((id) => id !== employee.user.id);
      }
      return [...prev, employee.user.id];
    });
  };

  const handleAssignEmployees = async () => {
    const loadingToastId = toast.loading("Asignando empleados al equipo", {
      position: "top-center",
    });
    create.mutate(
      selectedUserIds.map((s) => ({
        userId: s,
        teamId,
      })),
      {
        onSuccess: () => {
          toast.success("Empleados asignados exitosamente", {
            position: "top-center",
          });
          setSelectedUserIds([]);
          setSearchQuery("");
          setOpen(false);
        },
        onError: () => {
          toast.error("Error asignando empleados", {
            position: "top-center",
          });
        },
        onSettled: () => {
          toast.dismiss(loadingToastId);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedUserIds([]);
          setSearchQuery("");
        }
        setOpen(v);
      }}
    >
      <DialogTrigger render={(props) => <Button {...props} />}>
        <UserPlusIcon />
        <span>Asignar</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar empleado</DialogTitle>
          <DialogDescription>
            Busca y selecciona un empleado para agregar a este equipo.
          </DialogDescription>
        </DialogHeader>
        <SearchInput
          placeholder="Buscar Empleados"
          value={searchQuery}
          onChange={setSearchQuery}
          disabled={create.isPending}
        />
        {employees.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron empleados o ya están asignados a este equipo.
          </p>
        )}
        {employees.map((employee) => (
          <Button
            key={employee.id}
            variant="outline"
            className="py-8 px-4 flex justify-between"
            onClick={() => selectEmployee(employee)}
          >
            <div className="flex items-center gap-x-2">
              <Avatar>
                <AvatarFallback>
                  {toAvatarFallback(employee.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-start flex-col">
                <p className="text-sm font-medium">{employee.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {employee.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Checkbox
                checked={selectedUserIds.includes(employee.user.id)}
                onClick={() => selectEmployee(employee)}
              />
            </div>
          </Button>
        ))}
        <DialogFooter>
          <DialogClose
            render={(props) => <Button {...props} variant="outline" />}
          >
            Cancelar
          </DialogClose>
          <Button
            disabled={selectedUserIds.length === 0 || create.isPending}
            onClick={handleAssignEmployees}
          >
            Asignar ({selectedUserIds.length}) Empleados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
