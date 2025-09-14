import { useState } from "react";
import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { EmployeesSummaryTable } from "@/core/employees/presentation/components/employees-summary-table";
import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/components/ui/dialog";
import type { GroupDetail } from "@repo/core/entities/group";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { UserSummary } from "@repo/core/entities/user";
import { useMutateGroups } from "@/core/business/application/hooks/use.mutate-groups";

interface Props {
  group: GroupDetail;
  businessId: string;
}

function EmployeeListDialog({ businessId, group }: Props) {
  const { data: business } = useFindOneBusiness(businessId);
  const { assignEmployees } = useMutateGroups();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const selectEmployee = (employee: UserSummary) => {
    if (selectedEmployees.includes(employee.id)) {
      setSelectedEmployees(
        selectedEmployees.filter((id) => id !== employee.id)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee.id]);
    }
  };

  const employeesToShow = business.employees.filter(
    (user) => !group.users.some((u) => u.id === user.id)
  );

  const handleClick = () => {
    assignEmployees.mutate({
      businessId,
      groupId: group.id,
      employeeIds: selectedEmployees,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full border-2">
          Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Otros empleados de la empresa</DialogTitle>
          <DialogDescription>
            Selecciona los empleados que deseas agregar a este grupo
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {employeesToShow.map((user) => (
            <li
              className="border p-4 flex justify-between items-center"
              onClick={() => selectEmployee(user)}
              key={user.id}
            >
              <Checkbox
                onClick={() => selectEmployee(user)}
                checked={selectedEmployees.includes(user.id)}
              />
              <span>
                {user.firstName} {user.lastName}
              </span>
            </li>
          ))}
          {!business.employees.length && (
            <p className="text-muted-foreground text-sm">
              No hay empleados registrados en la empresa
            </p>
          )}
          {business.employees.length > 0 && !employeesToShow.length && (
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
            disabled={
              selectedEmployees.length === 0 || assignEmployees.isPending
            }
            onClick={handleClick}
          >
            Agregar ({selectedEmployees.length}) empleados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeesTable({ group, businessId }: Props) {
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Empleados</CardTitle>
          <CardDescription>{group.users.length} empleados</CardDescription>
        </div>
        <div>
          <EmployeeListDialog businessId={businessId} group={group} />
        </div>
      </CardHeader>
      <CardContent>
        <EmployeesSummaryTable.Root data={group.users} variant="detail">
          <EmployeesSummaryTable.Header />
          <EmployeesSummaryTable.Body />
        </EmployeesSummaryTable.Root>
      </CardContent>
    </Card>
  );
}
