import { useMemo } from "react";
import {
  count,
  eq,
  ilike,
  Query,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import type { Team } from "@/modules/new-teams/application/collections/teams.collections";
import type { Employee } from "../collections/employees.collection";
import { useEmployeesCollection } from "./use-employees-collection";
import { useTeamsCollection } from "@/modules/new-teams/application/hooks/use-teams-collection";
import { useTeamsMembersCollection } from "@/modules/new-teams/application/hooks/use-teams-members-collection";

export type EmployeeWithTeams = Employee & {
  teams: Team[];
};

type Filters = {
  name?: string;
  email?: string;
};

type FindAllEmployeesByTeam = {
  teamId: string;
  inside?: boolean;
  filters?: Filters;
};

export function useFindAllEmployees(filters?: Filters) {
  const employeesCollection = useEmployeesCollection();
  const teamsCollection = useTeamsCollection();
  const teamsMembersCollection = useTeamsMembersCollection();

  const name = filters?.name;
  const email = filters?.email;

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ employee: employeesCollection })
      .join(
        { teamMember: teamsMembersCollection },
        ({ teamMember, employee }) => eq(teamMember.userId, employee.user.id),
      )
      .join({ team: teamsCollection }, ({ teamMember, team }) =>
        eq(teamMember?.teamId, team.id),
      );

    if (name)
      query = query.where(({ employee }) =>
        ilike(employee.user.name, `%${name}%`),
      );

    if (email)
      query = query.where(({ employee }) =>
        ilike(employee.user.email, `%${email}%`),
      );

    return query;
  }, [name, email]);

  const employeesWithTeams = useMemo(
    () =>
      Object.values(
        data.reduce(
          (acc, { employee, teamMember, team }) => {
            if (!acc[employee.id])
              acc[employee.id] = { ...employee, teams: [] };

            if (teamMember && team) acc[employee.id].teams.push(team);

            return acc;
          },
          {} as Record<string, EmployeeWithTeams>,
        ),
      ),
    [data],
  );

  return employeesWithTeams;
}

export function useFindAllEmployeesByTeam({
  inside = true,
  teamId,
  filters,
}: FindAllEmployeesByTeam) {
  const employees = useFindAllEmployees(filters);

  return useMemo(
    () =>
      employees.filter((employee) => {
        const onTeam = employee.teams.some((team) => team.id === teamId);

        return inside ? onTeam : !onTeam;
      }),
    [employees, teamId, inside],
  );
}

export function useFindOneEmployee(id: string) {
  const employeesCollection = useEmployeesCollection();

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ employee: employeesCollection })
      .where(({ employee }) => eq(employee.id, id))
      .findOne();

    return query;
  });

  if (!data) throw new Error(`Employee with id ${id} not found`);

  return data;
}

export function useCountTotalEmployees() {
  const employeesCollection = useEmployeesCollection();

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ employee: employeesCollection })
      .select(({ employee }) => ({ total: count(employee.id) }))
      .findOne();

    return query;
  });

  return data?.total || 0;
}
