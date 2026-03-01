import { useMemo } from "react";
import { eq, ilike, Query, useLiveSuspenseQuery } from "@tanstack/react-db";

import { useTeamsCollection } from "./use-teams-collection";
import { useTeamsMembersCollection } from "./use-teams-members-collection";
import type { Team } from "../collections/teams.collections";
import type { TeamMember } from "../collections/teams-members.collections";

type Filters = {
  name?: string;
};

export type TeamWithMembers = Team & {
  members: TeamMember[];
};

type FindAllByEmployee = {
  userId: string;
  inside?: boolean;
  filters?: Filters;
};

export function useFindAllTeams(filters?: Filters): TeamWithMembers[] {
  const teamsCollection = useTeamsCollection();
  const teamsMembersCollection = useTeamsMembersCollection();

  const name = filters?.name;

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ team: teamsCollection })
      .join({ teamMember: teamsMembersCollection }, ({ team, teamMember }) =>
        eq(teamMember.teamId, team.id),
      );

    if (name) query = query.where(({ team }) => ilike(team.name, `%${name}%`));

    return query;
  }, [name]);

  const teamsWithMembers = useMemo(() => {
    return Object.values(
      data.reduce(
        (acc, { team, teamMember }) => {
          if (!acc[team.id]) acc[team.id] = { ...team, members: [] };

          if (teamMember) acc[team.id].members.push(teamMember);

          return acc;
        },
        {} as Record<string, TeamWithMembers>,
      ),
    );
  }, [data]);

  return teamsWithMembers;
}

export function useFindAllTeamsByEmployee({
  userId,
  inside = true,
  filters,
}: FindAllByEmployee) {
  const teams = useFindAllTeams(filters);

  return useMemo(
    () =>
      teams.filter((t) => {
        const isMember = t.members.some((m) => m.userId === userId);

        return inside ? isMember : !isMember;
      }),
    [teams, inside, userId],
  );
}

export function useFindTeamById(teamId: string): TeamWithMembers {
  const teamsCollection = useTeamsCollection();
  const teamsMembersCollection = useTeamsMembersCollection();

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ team: teamsCollection })
      .join({ teamMember: teamsMembersCollection }, ({ team, teamMember }) =>
        eq(teamMember.teamId, team.id),
      )
      .where(({ team }) => eq(team.id, teamId));

    return query;
  }, [teamId]);

  if (!data.length) throw new Error(`Team not found`);

  return {
    ...data[0].team,
    members: data.map((d) => d.teamMember).filter((m) => m !== undefined),
  };
}
