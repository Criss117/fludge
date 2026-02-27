import {
  SearchInput,
  SearchInputSkeleton,
} from "@/modules/shared/components/search-input";
import { useDataTable } from "@/modules/shared/components/data-table";
import { useFilters } from "@/modules/shared/store/teams-filters.store";
import { TeamsTableSkeleton } from "@/modules/new-teams/presentation/components/teams-table/skeleton";
import { teamsTableColumns } from "@/modules/new-teams/presentation/components/teams-table/columns";
import type { TeamWithMembers } from "@/modules/new-teams/application/hooks/use-teams-queries";
import { useVerifiedSession } from "@/integrations/auth/context";

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
