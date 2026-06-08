import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

export type MemberSummary = Awaited<
  ReturnType<ORPCType["members"]["queries"]["findAll"]["call"]>
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
      queryKey: ["organizations", organizationId, "members"],
      queryFn: async () => {
        const data = await orpc.members.queries.findAll.call();

        return data;
        1;
      },
      getKey: (item) => item.id,
      defaultIndexType: BasicIndex,
    }),
  );

  collection.createIndex((row) => row.user.name);
  collection.createIndex((row) => row.user.email);
  collection.createIndex((row) => row.id);
  collection.createIndex((row) => row.organizationId);
  collection.createIndex((row) => row.userId);

  return collection;
}

export function memberCollectionBuilder(
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
