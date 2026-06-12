import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

export type GroupMemberSummary = Awaited<
  ReturnType<ORPCType["groupsMembers"]["queries"]["findAll"]["call"]>
>[number];

const collectionCache = new Map<string, ReturnType<typeof builder>>();

function builder(
  organizationId: string,
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  const groupMemberCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "groups-members"],
      queryFn: async () => {
        const data = await orpc.groupsMembers.queries.findAll.call();

        return data;
      },
      getKey: (item) => `${item.groupId}-${item.memberId}`,
      defaultIndexType: BasicIndex,
      onInsert: async ({ transaction }) => {
        const groupIds = new Set(
          transaction.mutations.map((m) => m.modified.groupId),
        );
        const memberIds = new Set(
          transaction.mutations.map((m) => m.modified.memberId),
        );

        const res = await orpc.groupsMembers.commands.assignMembers.call({
          groupIds: Array.from(groupIds),
          memberIds: Array.from(memberIds),
        });

        groupMemberCollection.utils.writeInsert(res);

        return {
          refetch: false,
        };
      },

      onDelete: async ({ transaction }) => {
        const groupIds = new Set(
          transaction.mutations.map((m) => m.original.groupId),
        );
        const memberIds = new Set(
          transaction.mutations.map((m) => m.original.memberId),
        );

        await orpc.groupsMembers.commands.unassignMembers.call({
          groupIds: Array.from(groupIds),
          memberIds: Array.from(memberIds),
        });

        groupMemberCollection.utils.writeDelete(
          transaction.mutations.map(
            (m) =>
              `${m.original.groupId}-${m.original.memberId}` as `${string}-${string}`,
          ),
        );

        return {
          refetch: false,
        };
      },
    }),
  );

  groupMemberCollection.createIndex((row) => row.groupId);
  groupMemberCollection.createIndex((row) => row.memberId);

  return groupMemberCollection;
}

export function groupMemberCollectionBuilder(
  organizationId: string,
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  if (!collectionCache.has(organizationId)) {
    collectionCache.set(
      organizationId,
      builder(organizationId, queryClient, orpc),
    );
  }
  return collectionCache.get(organizationId)!;
}
