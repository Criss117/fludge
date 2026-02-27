import { orpc } from "@/integrations/orpc";
import {
  createCollection,
  type Collection,
  type NonSingleResult,
} from "@tanstack/db";
import {
  queryCollectionOptions,
  type QueryCollectionUtils,
} from "@tanstack/query-db-collection";
import { queryClient } from "@/integrations/tanstack-query";
import { teamsMembersCollectionBuilder } from "./teams-members.collections";

export type Team = Awaited<
  ReturnType<typeof orpc.teams.findAll.call>
>["teams"][number] & {
  isPending?: boolean;
};

type TeamCollection = Collection<
  Team,
  string | number,
  QueryCollectionUtils<Team, string | number, Team, unknown>,
  never,
  Team
> &
  NonSingleResult;

const collectionsCache = new Map<string, TeamCollection>();

export function teamsCollectionBuilder(orgId: string) {
  const teamsMembersCollection = teamsMembersCollectionBuilder(orgId);

  if (!collectionsCache.has(orgId)) {
    const newTeamsCollection = createCollection(
      queryCollectionOptions<Team>({
        queryKey: ["organization", orgId, "teams"],
        queryFn: async () => {
          const { teams, teamsMembers } = await orpc.teams.findAll.call();

          await teamsMembersCollection.preload();

          teamsMembersCollection.utils.writeInsert(teamsMembers);

          return teams;
        },
        getKey: (item) => item.id,
        queryClient,

        onInsert: async ({ transaction, collection }) => {
          const newItem = transaction.mutations[0].modified;

          const insertedTeam = await orpc.teams.create.call({
            name: newItem.name,
            permissions: newItem.permissions,
            description: newItem.description,
          });

          collection.utils.writeInsert(insertedTeam);

          return { refetch: false };
        },

        onUpdate: async ({ transaction, collection }) => {
          const updatedItem = transaction.mutations[0].modified;

          const updatedTeam = await orpc.teams.update.call({
            id: updatedItem.id,
            name: updatedItem.name,
            permissions: updatedItem.permissions,
            description: updatedItem.description,
          });

          collection.utils.writeUpdate(updatedTeam);

          return { refetch: false };
        },

        onDelete: async ({ transaction, collection }) => {
          const teamIds = transaction.mutations.map(
            (mutation) => mutation.modified.id,
          );

          await orpc.teams.remove.call({
            ids: teamIds,
          });

          const teamsMembersToDelete = Array.from(
            teamsMembersCollection.entries(),
          )
            .filter(([, member]) => teamIds.includes(member.teamId))
            .map(([, member]) => member.id);

          teamsMembersCollection.utils.writeDelete(teamsMembersToDelete);
          collection.utils.writeDelete(teamIds);

          return { refetch: false };
        },
      }),
    );

    collectionsCache.set(orgId, newTeamsCollection);
  }

  return collectionsCache.get(orgId)!;
}
