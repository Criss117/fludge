import { useState } from "react";
import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { GroupsTable } from "@/core/business/presentation/components/groups-table";
import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/core/shared/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type { GroupSummary } from "@repo/core/entities/group";
import { useMutateEmployees } from "@/core/employees/application/hooks/use.mutate-employees";

interface Props {
  businessId: string;
  employeeId: string;
  groups: GroupSummary[];
}

function GroupsListDialog({ businessId, groups, employeeId }: Props) {
  const { data: business } = useFindOneBusiness(businessId);
  const { assignGroups } = useMutateEmployees();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const selectGroups = (group: GroupSummary) => {
    if (selectedGroups.includes(group.id)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group.id]);
    }
  };

  const groupsToShow = business.groups.filter(
    (group) => !groups.some((g) => g.id === group.id)
  );

  const handleClick = () => {
    assignGroups.mutate({
      businessId,
      employeeId,
      groupIds: selectedGroups,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full border-2">
          Agregar Grupos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grupos</DialogTitle>
          <DialogDescription>
            Selecciona los grupos que deseas agregar a este empleado
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {groupsToShow.map((group) => (
            <li
              className="border p-4 flex justify-between items-center"
              onClick={() => selectGroups(group)}
              key={group.id}
            >
              <Checkbox
                onClick={() => selectGroups(group)}
                checked={selectedGroups.includes(group.id)}
              />
              <span>{group.name}</span>
            </li>
          ))}
          {!business.employees.length && (
            <p className="text-muted-foreground text-sm">
              No hay empleados registrados en la empresa
            </p>
          )}
          {business.employees.length > 0 && !groupsToShow.length && (
            <p className="text-muted-foreground text-sm">
              Los empleados registrados ya estan asignados al grupo o no hay
              empleados registrados
            </p>
          )}
        </ul>
        <DialogFooter className="sm:justify-between ">
          <DialogClose>
            <Button variant="destructive">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={selectedGroups.length === 0 || assignGroups.isPending}
            onClick={handleClick}
          >
            Agregar ({selectedGroups.length}) grupos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeeGroupsTable({ groups, businessId, employeeId }: Props) {
  return (
    <Card>
      <GroupsTable.Root data={groups} businessId={businessId}>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Grupos</CardTitle>
            <CardDescription>
              {groups.length} {groups.length > 1 ? "grupos" : "grupo"}
            </CardDescription>
          </div>
          <div>
            <GroupsListDialog
              businessId={businessId}
              groups={groups}
              employeeId={employeeId}
            />
          </div>
        </CardHeader>
        <CardContent>
          <GroupsTable.Content>
            <GroupsTable.Header />
            <GroupsTable.Body />
          </GroupsTable.Content>
        </CardContent>
      </GroupsTable.Root>
    </Card>
  );
}
