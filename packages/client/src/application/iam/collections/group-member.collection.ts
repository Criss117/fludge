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
  const collection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "groups-members"],
      queryFn: async () => {
        const data = await orpc.groupsMembers.queries.findAll.call();

        return data;
      },
      getKey: (item) => item.memberId + item.groupId,
      defaultIndexType: BasicIndex,
    }),
  );

  collection.createIndex((row) => row.groupId);
  collection.createIndex((row) => row.memberId);

  return collection;
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
