import { Briefcase } from "lucide-react";

import { useDataTable } from "@shared/components/data-table";
import { SearchInput } from "@shared/components/search-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { useFilters } from "@shared/store/teams-filters.store";

import { RemoveTeamsFromEmployee } from "@employees/presentation/components/remove-teams-from-employee";
import { AssignTeamsToEmployee } from "@employees/presentation/components/assign-teams-to-employee";
import type { Employee } from "@employees/application/collections/employees.collection";

import { useFindAllTeamsByEmployee } from "@teams/application/hooks/use-teams-queries";
import { teamsTableColumnsSummary } from "@teams/presentation/components/teams-table/columns";

interface Props {
  employee: Employee;
  orgSlug: string;
}

export function EmployeeTeamsSection({ employee, orgSlug }: Props) {
  const { filters, filtersDispatch } = useFilters();

  const teams = useFindAllTeamsByEmployee({
    filters: {
      name: filters.query,
    },
    userId: employee.user.id,
  });

  const table = useDataTable({
    columns: teamsTableColumnsSummary(orgSlug),
    data: teams || [],
    getRowId: (row) => row.id,
  });

  const selectedTeams = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-x-2">
          <div className="p-2 rounded-md bg-primary/20">
            <Briefcase size={28} />
          </div>
          <div>
            <CardTitle>Equipos</CardTitle>
            {/*<CardDescription>
              {teams.length || 0} equipos asignados
            </CardDescription>*/}
          </div>
        </div>
        <div className="space-x-2">
          <RemoveTeamsFromEmployee
            userId={employee.user.id}
            selectedTeams={selectedTeams}
          />
          <AssignTeamsToEmployee userId={employee.user.id} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="w-2/5">
            <SearchInput
              placeholder="Buscar equipos por nombre"
              value={filters.query}
              onChange={(v) => {
                filtersDispatch({
                  action: "set:query",
                  payload: v,
                });
              }}
            />
          </div>
          <div className="flex gap-x-2 items-center justify-end">
            <table.FirstPageButton />
            <table.PrevButton />
            <table.PageSizeSelect />
            <table.NextButton />
            <table.LastPageButton />
          </div>
        </div>

        <table.Content />

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
