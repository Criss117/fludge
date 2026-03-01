import { UsersIcon } from "lucide-react";
import { useVerifiedSession } from "@/integrations/auth/context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";
import { useDataTable } from "@shared/components/data-table";
import { SearchInput } from "@shared/components/search-input";
import { Separator } from "@shared/components/ui/separator";
import { useFilters } from "@/modules/shared/store/filters.store";

import { useFindAllEmployeesByTeam } from "@employees/application/hooks/use-employees-queries";
import { employeesTableColumns } from "@employees/presentation/components/employees-table/columns";

import { RemoveEmployeesFromTeam } from "@teams/presentation/components/remove-employees-from-team";
import { AssignEmployeeToTeam } from "@teams/presentation/components/assign-employee-to-team";

interface Props {
  team: TeamWithMembers;
}

export function TeamEmployeesSection({ team }: Props) {
  const session = useVerifiedSession();
  const { filters, filtersDispatch } = useFilters();

  const employees = useFindAllEmployeesByTeam({
    teamId: team.id,
    filters: { email: filters.query, name: filters.query },
  });

  const table = useDataTable({
    columns: employeesTableColumns(session.activeOrganization.slug),
    data: employees || [],
    getRowId: (row) => row.id,
  });

  const selectedEmployees = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  return (
    <Card className="gap-4">
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-x-2">
          <div className="p-2 rounded-md bg-primary/20">
            <UsersIcon size={28} />
          </div>
          <div>
            <CardTitle>Miembros del equipo</CardTitle>
            <CardDescription>
              {team.members.length || 0} empleados
            </CardDescription>
          </div>
        </div>
        <div className="space-x-2">
          <RemoveEmployeesFromTeam
            selectedEmployees={selectedEmployees}
            teamId={team.id}
          />
          <AssignEmployeeToTeam teamId={team.id} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="w-2/5">
            <SearchInput
              placeholder="Buscar empleados por nombre o correo electronico"
              value={filters.query}
              onChange={(v) =>
                filtersDispatch({
                  action: "set:query",
                  payload: v,
                })
              }
            />
          </div>

          <div className="flex gap-x-2 items-center">
            <table.FirstPageButton />
            <table.PrevButton />
            <table.PageSizeSelect />
            <table.NextButton />
            <table.LastPageButton />
          </div>
        </div>

        <table.Content emptyMessage="No hay Empleados asignados" />
        <div className="flex gap-x-2 items-center justify-end">
          <table.FirstPageButton />
          <table.PrevButton />
          <table.PageSizeSelect />
          <table.NextButton />
          <table.LastPageButton />
        </div>
      </CardContent>
    </Card>
  );
}
