import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Button } from "@/modules/shared/components/ui/button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
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
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { toAvatarFallback } from "@fludge/utils/helpers";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useMutateTeams } from "../../application/hooks/use-mutate-teams";
import { useEmployeesQueries } from "@/modules/employees/application/hooks/use-employees-queries";
import { toast } from "sonner";

interface Props {
  teamId: string;
}

export function AssignEmployeeToTeam({ teamId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { assignEmployees } = useMutateTeams();
  const { findManyEmployees } = useEmployeesQueries();

  const { data: employees } = useLiveSuspenseQuery(
    () =>
      findManyEmployees({
        filterBy: {
          team: {
            id: teamId,
            type: "outside",
          },
          name: searchQuery,
          email: searchQuery,
        },
      }),
    [searchQuery, selectedEmployees],
  );

  const selectEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }
      return [...prev, employeeId];
    });
  };

  const handleAssignEmployees = async () => {
    const loadingToastId = toast.loading("Asignando empleados al equipo", {
      position: "top-center",
    });
    assignEmployees.mutate(
      {
        teamId,
        employeeIds: selectedEmployees,
      },
      {
        onSuccess: () => {
          toast.success("Empleados asignados exitosamente", {
            position: "top-center",
          });
          setSelectedEmployees([]);
          setSearchQuery("");
          setOpen(false);
        },
        onError: (error) => {
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
          setSelectedEmployees([]);
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
          disabled={assignEmployees.isPending}
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
            onClick={() => selectEmployee(employee.user.id)}
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
                checked={selectedEmployees.includes(employee.user.id)}
                onClick={() => selectEmployee(employee.user.id)}
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
            disabled={
              selectedEmployees.length === 0 || assignEmployees.isPending
            }
            onClick={handleAssignEmployees}
          >
            Asignar ({selectedEmployees.length}) Empleados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
