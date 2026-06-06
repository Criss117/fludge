import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

export const GROUP_COLLECTION_KEY = ["iam", "groups"] as const;
export type GroupSummary = Awaited<
  ReturnType<ORPCType["groups"]["queries"]["findAll"]["call"]>
>[number];

let collection: ReturnType<typeof builder> | null = null;

function builder(queryClient: QueryClient, orpc: ORPCType) {
  const groupCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: GROUP_COLLECTION_KEY,
      queryFn: async () => {
        const data = await orpc.groups.queries.findAll.call();

        return data;
      },
      getKey: (item) => item.id,
    }),
  );

  return groupCollection;
}

export function groupCollectionBuilder(
  queryClient: QueryClient,
  orpc: ORPCType,
) {
  if (!collection) {
    collection = builder(queryClient, orpc);
  }

  return collection;
}
