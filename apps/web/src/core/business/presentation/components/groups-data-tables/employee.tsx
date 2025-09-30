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
} from "@/core/shared/components/ui/alert-dialog";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";

interface Props {
  group: GroupDetail;
  businessId: string;
}

interface RemoveEmployeesProps {
  businessId: string;
  groupId: string;
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
          <PlusCircleIcon />
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

function RemoveEmployees({ businessId, groupId }: RemoveEmployeesProps) {
  const { table } = EmployeesSummaryTable.useEmployeesTable();
  const { removeEmployees } = useMutateGroups();

  const selectedEmployees = table
    .getSelectedRowModel()
    .rows.flatMap((r) => r.original);

  const handleClick = () => {
    removeEmployees.mutate({
      businessId,
      groupId,
      employeeIds: selectedEmployees.map((e) => e.id),
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="rounded-full"
          disabled={!selectedEmployees.length}
        >
          <Trash2Icon />
          Eliminar{" "}
          {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}{" "}
          empleados
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar empleados</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro que deseas eliminar los empleados?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p>
          Se eliminaran ({selectedEmployees.length}) empleados de este grupo
        </p>

        <ul>
          {selectedEmployees.map((user) => (
            <li key={user.id}>
              - {user.firstName} {user.lastName}
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground text-sm">
          Si un empleado no está asignado a ningún grupo, este no podrá acceder
          a la aplicación
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClick}
            disabled={removeEmployees.isPending}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EmployeesTable({ group, businessId }: Props) {
  const { userHasPermissions } = usePermissions();

  const canUpdateGroups = userHasPermissions("groups:update");

  return (
    <Card>
      <EmployeesSummaryTable.Root
        data={group.users}
        variant="detail"
        businessId={businessId}
      >
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>{group.users.length} empleados</CardDescription>
          </div>
          <div className="space-x-2">
            {canUpdateGroups && (
              <>
                <RemoveEmployees businessId={businessId} groupId={group.id} />
                <EmployeeListDialog businessId={businessId} group={group} />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <EmployeesSummaryTable.Content>
            <EmployeesSummaryTable.Header />
            <EmployeesSummaryTable.Body />
          </EmployeesSummaryTable.Content>
        </CardContent>
      </EmployeesSummaryTable.Root>
    </Card>
  );
}
