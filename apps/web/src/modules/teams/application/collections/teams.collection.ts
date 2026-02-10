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

export type Team = Awaited<ReturnType<typeof orpc.teams.create.call>> & {
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

export function teamsCollection(orgId: string) {
  if (!collectionsCache.has(orgId)) {
    const collection = createCollection(
      queryCollectionOptions<Team>({
        queryKey: ["organization", orgId, "teams"],
        queryFn: () => {
          return orpc.teams.findMany.call();
        },
        getKey: (item) => item.id,
        queryClient,
        onInsert: async ({ transaction, collection }) => {
          const newItem = transaction.mutations[0].modified;

          const insertedTeam = await orpc.teams.create.call(newItem);

          collection.utils.writeInsert(insertedTeam);

          return { refetch: false };
        },
        onDelete: async ({ transaction, collection }) => {
          const teamIds = transaction.mutations.flatMap(
            (mutation) => mutation.modified.id,
          );

          await orpc.teams.remove.call({
            ids: teamIds,
          });

          collection.utils.writeDelete(teamIds);

          return { refetch: false };
        },
      }),
    );

    collectionsCache.set(orgId, collection);
  }

  return collectionsCache.get(orgId)!;
}
