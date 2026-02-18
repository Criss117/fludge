import { count, eq, ilike, Query } from "@tanstack/db";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import type { Filters } from "../store/teams-filters.store";

type FindOneTeamOptions = {
  filterBy: {
    id: string;
  };
};

export function useTeamsQueries() {
  const teamsCollection = useTeamsCollection();

  const totalEmployees = () =>
    new Query()
      .from({ teams: teamsCollection })
      .select(({ teams }) => ({
        total: count(teams.id),
      }))
      .findOne();

  const findAllTeams = (filters: Filters) => {
    let q = new Query();

    if (filters.query.length === 0) return q.from({ teams: teamsCollection });

    return q
      .from({ teams: teamsCollection })
      .where(({ teams }) => ilike(teams.name, `%${filters.query}%`));
  };

  const findOneTeam = (options: FindOneTeamOptions) =>
    new Query()
      .from({ teams: teamsCollection })
      .where(({ teams }) => eq(teams.id, options.filterBy.id))
      .findOne();

  return { teamsCollection, totalEmployees, findAllTeams, findOneTeam };
}
