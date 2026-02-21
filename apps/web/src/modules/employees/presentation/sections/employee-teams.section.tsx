import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Briefcase } from "lucide-react";
import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import { useDataTable } from "@/modules/shared/components/data-table";
import { SearchInput } from "@/modules/shared/components/search-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { useTeamsQueries } from "@/modules/teams/application/hooks/use-teams-queries";
import { teamsTableColumnsSummary } from "@/modules/teams/presentation/components/teams-table/columns";
import { useFilters } from "@/modules/shared/store/teams-filters.store";

interface Props {
  employee: Employee;
  orgSlug: string;
}

export function EmployeeTeamsSection({ employee, orgSlug }: Props) {
  const { findManyTeams } = useTeamsQueries();
  const { filters, filtersDispatch } = useFilters();

  const { data: teams } = useLiveSuspenseQuery(
    () =>
      findManyTeams({
        employee: {
          userId: employee.user.id,
          type: "inside",
        },
        name: filters.query,
      }),
    [employee.user.id, filters.query],
  );

  const table = useDataTable({
    columns: teamsTableColumnsSummary(orgSlug),
    data: teams || [],
    getRowId: (row) => row.id,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-x-2">
          <div className="p-2 rounded-md bg-primary/20">
            <Briefcase size={28} />
          </div>
          <div>
            <CardTitle>Equipos</CardTitle>
            <CardDescription>
              {employee.teams.length || 0} equipos asignados
            </CardDescription>
          </div>
        </div>
        <div className="space-x-2"></div>
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
