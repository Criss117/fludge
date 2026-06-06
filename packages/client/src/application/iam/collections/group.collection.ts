import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

export type GroupSummary = Awaited<
  ReturnType<ORPCType["groups"]["queries"]["findAll"]["call"]>
>[number];

const collectionCache = new Map<string, ReturnType<typeof builder>>();

function builder(
  organizationId: string,
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  const groupCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "groups"],
      queryFn: async () => {
        const data = await orpc.groups.queries.findAll.call();

        return data;
      },
      getKey: (item) => item.id,
      defaultIndexType: BasicIndex,
    }),
  );

  groupCollection.createIndex((row) => row.name);
  groupCollection.createIndex((row) => row.slug);
  groupCollection.createIndex((row) => row.id);

  return groupCollection;
}

export function groupCollectionBuilder(
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
