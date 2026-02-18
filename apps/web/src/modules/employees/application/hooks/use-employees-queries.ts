import { count, ilike, inArray, like, or, Query } from "@tanstack/db";
import { useEmployeesCollection } from "./use-employees-collection";

type FindManyEmployeesOptions = {
  filterBy?: {
    team?: {
      id?: string;
      type: "inside" | "outside";
    };
    name?: string;
    email?: string;
    teamName?: string;
  };
};

type FindManyEmployeesOnTeamOptions = {
  filterBy: {
    teamId: string;
    name?: string;
    selectedEmployeeIds?: string[];
  };
};

export function useEmployeesQueries() {
  const employeesCollection = useEmployeesCollection();

  const findManyEmployees = (filters?: FindManyEmployeesOptions) => {
    let query = new Query().from({
      employees: employeesCollection,
    });

    if (!filters?.filterBy) return query;

    const team = filters.filterBy.team;
    const name = filters.filterBy.name;
    const email = filters.filterBy.email;

    if (email || name) {
      query = query.where(({ employees }) => {
        const opts = [];

        if (name) opts.push(ilike(employees.user.name, `%${name}%`));
        if (email) opts.push(ilike(employees.user.email, `%${email}%`));

        if (opts.length === 2) return or(opts[0], opts[1]);

        return opts[0];
      });
    }

    if (team) {
      query = query.fn.where(({ employees }) => {
        const onTeam = employees.teams.some((t) => t.id === team.id);

        return team.type === "inside" ? onTeam : !onTeam;
      });
    }
    return query;
  };

  const findManyEmployeesOnTeam = (options: FindManyEmployeesOnTeamOptions) => {
    let query = new Query()
      .from({ employees: employeesCollection })
      .where(({ employees }) =>
        or(
          like(employees.user.name, `%${options.filterBy.name}%`),
          inArray(employees.id, options.filterBy.selectedEmployeeIds),
        ),
      );

    return query;
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
