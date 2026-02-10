import { ilike, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import { useTeamsFilters } from "@/modules/teams/application/store/teams-filters.store";
import { TeamsTable } from "../components/teams-table";
import { Input } from "@/modules/shared/components/ui/input";
import { SearchInput } from "@/modules/shared/components/search-input";

export function TeamsListSection({ orgSlug }: { orgSlug: string }) {
  const { filters, filtersDispatch } = useTeamsFilters();
  const teamsCollection = useTeamsCollection();
  const { data: teams } = useLiveSuspenseQuery(
    (q) => {
      if (filters.query.length === 0) return q.from({ teams: teamsCollection });

      return q
        .from({ teams: teamsCollection })
        .where(({ teams }) => ilike(teams.name, `%${filters.query}%`));
    },
    [filters.query],
  );

  return (
    <TeamsTable.Root teams={teams} orgSlug={orgSlug}>
      <header className="flex justify-between items-center">
        <div className="w-1/3">
          <SearchInput
            placeholder="Buscar Equipos"
            value={filters.query}
            onChange={(value) =>
              filtersDispatch({ action: "set:query", payload: value })
            }
          />
        </div>

        <div className="gap-x-2 flex items-center">
          <TeamsTable.FirstPageButton />
          <TeamsTable.PrevButton />
          <TeamsTable.PageSizeSelect />
          <TeamsTable.NextButton />
          <TeamsTable.LastPageButton />
        </div>
      </header>

      <TeamsTable.Content />

      <footer className="flex gap-x-2 items-center justify-end">
        <TeamsTable.FirstPageButton />
        <TeamsTable.PrevButton />
        <TeamsTable.PageSizeSelect />
        <TeamsTable.NextButton />
        <TeamsTable.LastPageButton />
      </footer>
    </TeamsTable.Root>
  );
}
