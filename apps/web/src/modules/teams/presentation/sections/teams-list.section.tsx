import { useVerifiedSession } from "@/integrations/auth/context";

import {
  SearchInput,
  SearchInputSkeleton,
} from "@shared/components/search-input";
import { useDataTable } from "@shared/components/data-table";
import { useFilters } from "@shared/store/teams-filters.store";

import { TeamsTableSkeleton } from "@teams/presentation/components/teams-table/skeleton";
import { teamsTableColumns } from "@teams/presentation/components/teams-table/columns";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";

interface Props {
  teams: TeamWithMembers[];
}

export function TeamsListSection({ teams }: Props) {
  const session = useVerifiedSession();
  const { filters, filtersDispatch } = useFilters();

  const table = useDataTable({
    columns: teamsTableColumns(session.activeOrganization.slug),
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
