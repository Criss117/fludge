import { useLiveSuspenseQuery } from "@tanstack/react-db";
import {
  SearchInput,
  SearchInputSkeleton,
} from "@/modules/shared/components/search-input";
import { TeamsTableSkeleton } from "@/modules/teams/presentation/components/teams-table/skeleton";
import { useDataTable } from "@/modules/shared/components/data-table";
import { teamsTableColumns } from "@/modules/teams/presentation/components/teams-table/columns";
import { useTeamsQueries } from "@/modules/teams/application/hooks/use-teams-queries";
import { useFilters } from "@/modules/shared/store/teams-filters.store";

export function TeamsListSection({ orgSlug }: { orgSlug: string }) {
  const { filters, filtersDispatch } = useFilters();
  const { findAllTeams } = useTeamsQueries();
  const { data: teams } = useLiveSuspenseQuery(
    () => findAllTeams(filters),
    [filters.query],
  );

  const table = useDataTable({
    columns: teamsTableColumns(orgSlug),
    data: teams || [],
    getRowId: (row) => row.id,
  });

  return (
    <section className="space-y-4">
      <header className="flex justify-between items-center">
        <div className="w-1/3">
          <SearchInput
            placeholder="Buscar equipos por nombre"
            value={filters.query}
            onChange={(value) =>
              filtersDispatch({ action: "set:query", payload: value })
            }
          />
        </div>

        <div className="gap-x-2 flex items-center">
          <table.FirstPageButton />
          <table.PrevButton />
          <table.PageSizeSelect />
          <table.NextButton />
          <table.LastPageButton />
        </div>
      </header>

      <table.Content emptyMessage="No hay Equipos Creados" />

      <footer className="flex gap-x-2 items-center justify-end">
        <table.FirstPageButton />
        <table.PrevButton />
        <table.PageSizeSelect />
        <table.NextButton />
        <table.LastPageButton />
      </footer>
    </section>
  );
}

export function TeamsListSectionSkeleton() {
  return (
    <>
      <header className="flex justify-between items-center">
        <div className="w-1/3">
          <SearchInputSkeleton placeholder="Buscar Equipos" />
        </div>

        <div className="gap-x-2 flex items-center">
          <TeamsTableSkeleton.FirstPageButton />
          <TeamsTableSkeleton.PrevButton />
          <TeamsTableSkeleton.PageSizeSelect />
          <TeamsTableSkeleton.NextButton />
          <TeamsTableSkeleton.LastPageButton />
        </div>
      </header>

      <TeamsTableSkeleton.Content />

      <footer className="flex gap-x-2 items-center justify-end">
        <TeamsTableSkeleton.FirstPageButton />
        <TeamsTableSkeleton.PrevButton />
        <TeamsTableSkeleton.PageSizeSelect />
        <TeamsTableSkeleton.NextButton />
        <TeamsTableSkeleton.LastPageButton />
      </footer>
    </>
  );
}
