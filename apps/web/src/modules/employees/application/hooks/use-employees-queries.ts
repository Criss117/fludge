import { count, eq, inArray, like, or, Query } from "@tanstack/db";
import { useEmployeesCollection } from "./use-employees-collection";

type FindManyEmployeesOptions = {
  filterBy?: {
    teamId?: string;
    name?: string;
  };
};

type FindManyEmployeesOnTeamOptions = {
  filterBy: {
    teamId: string;
    name: string;
    selectedEmployeeIds: string[];
  };
};

export function useEmployeesQueries() {
  const employeesCollection = useEmployeesCollection();

  const findManyEmployees = (filters?: FindManyEmployeesOptions) => {
    let query = new Query().from({
      employees: employeesCollection,
    });

    if (filters?.filterBy) {
      const teamId = filters.filterBy.teamId;
      const name = filters.filterBy.name;

      if (name) {
        query.where(({ employees }) => or(eq(employees.user.name, name), true));
      }

      if (teamId) {
        query.fn.where(({ employees }) =>
          employees.teams.flatMap((t) => t.id).includes(teamId),
        );
      }
    }

    return query;
  };

  const findManyEmployeesOnTeam = (options: FindManyEmployeesOnTeamOptions) => {
    return new Query()
      .from({ employees: employeesCollection })
      .where(({ employees }) =>
        or(
          like(employees.user.name, `%${options.filterBy.name}%`),
          inArray(employees.id, options.filterBy.selectedEmployeeIds),
        ),
      )
      .fn.where(
        ({ employees }) =>
          !employees.teams
            .flatMap((t) => t.id)
            .includes(options.filterBy.teamId),
      );
  };

  const totalEmployees = () => {
    return new Query()
      .from({ teams: employeesCollection })
      .select(({ teams }) => ({
        total: count(teams.id),
      }))
      .findOne();
  };

  return {
    employeesCollection,
    findManyEmployees,
    totalEmployees,
    findManyEmployeesOnTeam,
  };
}
