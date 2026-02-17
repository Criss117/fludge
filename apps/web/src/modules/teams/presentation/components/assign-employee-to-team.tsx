import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { inArray, like, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useEmployeesCollection } from "@/modules/employees/application/hooks/use-employees-collection";
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

interface Props {
  teamId: string;
}

export function AssignEmployeeToTeam({ teamId }: Props) {
  const employeesCollection = useEmployeesCollection();

  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  //TODO: filter employees not in team
  const { data: employees } = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ employees: employeesCollection })
        .where(({ employees }) =>
          or(
            like(employees.user.name, `%${searchQuery}%`),
            inArray(employees.id, selectedEmployees),
          ),
        ),
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
        />
        {employees.map((employee) => (
          <Button
            variant="outline"
            className="py-8 px-4 flex justify-between"
            onClick={() => selectEmployee(employee.id)}
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
                checked={selectedEmployees.includes(employee.id)}
                onClick={() => selectEmployee(employee.id)}
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
          <Button disabled={selectedEmployees.length === 0}>
            Asignar ({selectedEmployees.length}) Empleados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
