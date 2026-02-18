import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { UsersIcon } from "lucide-react";
import { employeesTableColumns } from "@/modules/employees/presentation/components/employees-table/columns";
import { useDataTable } from "@/modules/shared/components/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Separator } from "@/modules/shared/components/ui/separator";
import { AssignEmployeeToTeam } from "../components/assign-employee-to-team";
import { useEmployeesQueries } from "@/modules/employees/application/hooks/use-employees-queries";

interface Props {
  orgSlug: string;
  teamId: string;
}

export function EmployeesSection({ teamId, orgSlug }: Props) {
  const { findManyEmployees } = useEmployeesQueries();

  const { data } = useLiveSuspenseQuery(
    () =>
      findManyEmployees({
        filterBy: {
          teamId,
        },
      }),
    [teamId],
  );

  const table = useDataTable({
    columns: employeesTableColumns(orgSlug),
    data: data || [],
    getRowId: (row) => row.id,
  });

  return (
    <Card className="gap-4">
      <CardHeader className="flex justify-between">
        <div className="flex gap-x-2">
          <div className="p-2 rounded-md bg-primary/20">
            <UsersIcon size={28} />
          </div>
          <div>
            <CardTitle>Miembros del equipo</CardTitle>
            <CardDescription>{data?.length || 0} empleados</CardDescription>
          </div>
        </div>
        <AssignEmployeeToTeam teamId={teamId} />
      </CardHeader>
      <Separator />
      <CardContent>
        <table.Content emptyMessage="No hay Equipos Creados" />
      </CardContent>
    </Card>
  );
}
