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
import { RemoveEmployeesFromTeam } from "../components/remove-employees-from-team";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useFilters } from "@/modules/shared/store/teams-filters.store";

interface Props {
  orgSlug: string;
  teamId: string;
}

export function TeamEmployeesSection({ teamId, orgSlug }: Props) {
  const { findManyEmployees } = useEmployeesQueries();
  const { filters, filtersDispatch } = useFilters();

  const { data } = useLiveSuspenseQuery(
    () =>
      findManyEmployees({
        filterBy: {
          team: {
            id: teamId,
            type: "inside",
          },
          email: filters.query,
          name: filters.query,
        },
      }),
    [teamId, filters.query],
  );

  const table = useDataTable({
    columns: employeesTableColumns(orgSlug),
    data: data || [],
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
            <CardDescription>{data?.length || 0} empleados</CardDescription>
          </div>
        </div>
        <div className="space-x-2">
          <RemoveEmployeesFromTeam
            selectedEmployees={selectedEmployees}
            teamId={teamId}
          />
          <AssignEmployeeToTeam teamId={teamId} />
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
            <table.NextButton />
            <table.PageSizeSelect />
            <table.PrevButton />
            <table.LastPageButton />
          </div>
        </div>

        <table.Content emptyMessage="No hay Equipos Creados" />
        <div className="flex gap-x-2 items-center justify-end">
          <table.FirstPageButton />
          <table.NextButton />
          <table.PageSizeSelect />
          <table.PrevButton />
          <table.LastPageButton />
        </div>
      </CardContent>
    </Card>
  );
}
