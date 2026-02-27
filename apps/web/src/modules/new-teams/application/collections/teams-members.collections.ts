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

export type TeamMember = Awaited<
  ReturnType<typeof orpc.teams.findAll.call>
>["teamsMembers"][number] & {
  isPending?: boolean;
};

type TeamMemberCollection = Collection<
  TeamMember,
  string | number,
  QueryCollectionUtils<TeamMember, string | number, TeamMember, unknown>,
  never,
  TeamMember
> &
  NonSingleResult;

const collectionsCache = new Map<string, TeamMemberCollection>();

export function teamsMembersCollectionBuilder(orgId: string) {
  if (!collectionsCache.has(orgId)) {
    const newTeamsMembersCollection = createCollection(
      queryCollectionOptions<TeamMember>({
        queryKey: ["organization", orgId, "teams-members"],
        queryFn: async () => {
          return [] as TeamMember[];
        },
        getKey: (item) => item.id,
        queryClient,

        onInsert: async ({ transaction, collection }) => {
          const data = transaction.mutations.map((m) => ({
            userId: m.modified.userId,
            teamId: m.modified.teamId,
          }));

          const newData = await orpc.teams.teamMembers.create.call(data);

          collection.utils.writeInsert(newData);

          return { refetch: false };
        },

        onDelete: async ({ transaction, collection }) => {
          const data = transaction.mutations.map((m) => ({
            userId: m.original.userId,
            teamId: m.original.teamId,
          }));

          const ids = transaction.mutations.map((m) => m.original.id);

          await orpc.teams.teamMembers.delete.call(data);

          collection.utils.writeDelete(ids);

          return { refetch: false };
        },
      }),
    );

    collectionsCache.set(orgId, newTeamsMembersCollection);
  }

  return collectionsCache.get(orgId)!;
}
