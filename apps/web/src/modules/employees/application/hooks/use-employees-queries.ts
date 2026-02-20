import { count, eq, ilike, inArray, or, Query } from "@tanstack/db";
import { useEmployeesCollection } from "./use-employees-collection";

type FindManyEmployeesOptions = {
  filterBy?: {
    team?: {
      id?: string;
      type: "inside" | "outside";
    };
    name?: string;
    email?: string;
    teamMemberIds?: string[];
  };
};

export function useEmployeesQueries() {
  const employeesCollection = useEmployeesCollection();

  const findOneEmployee = (employeeId: string) => {
    return new Query()
      .from({
        employees: employeesCollection,
      })
      .where(({ employees }) => eq(employees.id, employeeId))
      .findOne();
  };

  const findManyEmployees = (filters?: FindManyEmployeesOptions) => {
    let query = new Query().from({
      employees: employeesCollection,
    });

    if (!filters?.filterBy) return query;

    const name = filters.filterBy.name;
    const email = filters.filterBy.email;
    const teamMemberIds = filters.filterBy.teamMemberIds;

    if (teamMemberIds) {
      query = query.where(({ employees }) => {
        return inArray(employees.user.id, teamMemberIds);
      });
    }

    if (email || name) {
      query = query.where(({ employees }) => {
        const orFilters = [];

        if (name) orFilters.push(ilike(employees.user.name, `%${name}%`));
        if (email) orFilters.push(ilike(employees.user.email, `%${email}%`));

        if (orFilters.length === 2) return or(orFilters[0], orFilters[1]);

        return orFilters[0];
      });
    }

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
    findOneEmployee,
  };
}
