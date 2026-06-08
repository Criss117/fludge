import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { ORPCType } from "@fludge/client/providers/orpc.provider";
import { QueryClient } from "@tanstack/react-query";

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
      onInsert: async ({ transaction }) => {
        const newGroup = transaction.mutations[0].modified;

        const serverNewGroup = await orpc.groups.commands.create.call({
          name: newGroup.name,
          permissions: newGroup.permissions,
          description: newGroup.description || "",
        });

        groupCollection.utils.writeInsert(serverNewGroup);

        return {
          refetch: false,
        };
      },

      onUpdate: async ({ transaction }) => {
        const originalGroup = transaction.mutations[0].original;
        const modifiedGroup = transaction.mutations[0].modified;

        const serverUpdatedGroup = await orpc.groups.commands.update.call({
          groupId: originalGroup.id,
          name: modifiedGroup.name,
          permissions: modifiedGroup.permissions,
          description: modifiedGroup.description || "",
        });

        groupCollection.utils.writeUpdate(serverUpdatedGroup);

        return {
          refetch: false,
        };
      },
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
