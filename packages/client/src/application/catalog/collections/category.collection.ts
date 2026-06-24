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
  const categoryCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "categories"],
      queryFn: async () => {
        const data = await orpc.categories.queries.findAll.call();

        return data;
      },
      getKey: (item) => item.id,
      defaultIndexType: BasicIndex,
      onInsert: async ({ transaction, collection }) => {
        const newCategory = transaction.mutations[0].modified;

        const createdCategory = await orpc.categories.commands.create.call({
          name: newCategory.name,
          parentId: newCategory.parentId ?? undefined,
        });

        collection.utils.writeInsert(createdCategory);

        return {
          refetch: false,
        };
      },

      onUpdate: async ({ transaction, collection }) => {
        const originalCategory = transaction.mutations[0].original;
        const modifiedCategory = transaction.mutations[0].modified;

        const updatedCategory = await orpc.categories.commands.update.call({
          id: originalCategory.id,
          name: modifiedCategory.name,
          parentId: modifiedCategory.parentId ?? undefined,
        });

        collection.utils.writeUpdate(updatedCategory);

        return {
          refetch: false,
        };
      },

      onDelete: async ({ transaction, collection }) => {
        const categoryIds = transaction.mutations.map((m) => m.original.id);

        await orpc.categories.commands.delete.call({ ids: categoryIds });

        collection.utils.writeDelete(categoryIds);

        return {
          refetch: false,
        };
      },
    }),
  );

  categoryCollection.createIndex((row) => row.name);
  categoryCollection.createIndex((row) => row.slug);
  categoryCollection.createIndex((row) => row.id);
  categoryCollection.createIndex((row) => row.parentId);

  return categoryCollection;
}

export function categoryCollectionBuilder(
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
