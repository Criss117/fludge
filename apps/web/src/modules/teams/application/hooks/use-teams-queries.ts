import { count, eq, ilike, Query } from "@tanstack/db";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import type { Filters } from "@/modules/shared/store/teams-filters.store";

type FindOneTeamOptions = {
  filterBy: {
    id: string;
  };
};

type FindManyTeamsOptions = {
  name?: string;
  employee?: {
    userId: string;
    type: "inside" | "outside";
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

  const findEmployeeTeams = (employeeId: string) => {
    let query = new Query()
      .from({ teams: teamsCollection })
      .fn.where(({ teams }) =>
        teams.employees.some((e) => e.id === employeeId),
      );

    return query;
  };

  const findManyTeams = (filters?: FindManyTeamsOptions) => {
    let query = new Query().from({ teams: teamsCollection });

    if (!filters) return query;

    const employee = filters.employee;
    const name = filters.name;

    if (name) {
      query = query.where(({ teams }) => ilike(teams.name, `%${name}%`));
    }

    if (employee) {
      query = query.fn.where(({ teams }) => {
        const onEmployee = teams.employees.some(
          (e) => e.id === employee.userId,
        );

        return employee.type === "inside" ? onEmployee : !onEmployee;
      });
    }

    return query;
  };

  const findOneTeam = (options: FindOneTeamOptions) =>
    new Query()
      .from({ teams: teamsCollection })
      .where(({ teams }) => eq(teams.id, options.filterBy.id))
      .findOne();

  return {
    teamsCollection,
    totalEmployees,
    findAllTeams,
    findOneTeam,
    findEmployeeTeams,
    findManyTeams,
  };
}
