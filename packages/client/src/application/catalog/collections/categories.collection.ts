import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { BasicIndex, collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import {
  createResourceCollection,
  indexedCollections,
} from "@fludge/client/shared/create-resource-collection";
import type { OrpcQueryClient } from "@fludge/client/providers/orpc.provider";

export type ProductPresentationSummary = Awaited<
  ReturnType<OrpcQueryClient["category"]["queries"]["findAll"]["call"]>
>[number];

const { useCollection, cache } = createResourceCollection(
  "categories",
  ({ id, queryKey }, orpc) => {
    return collectionOptions(id, (client) =>
      queryCollectionOptions({
        id: id,
        queryKey: queryKey,
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        defaultIndexType: BasicIndex,
        autoIndex: "eager",
        queryFn: async () => {
          const categories = await orpc.category.queries.findAll.call();

          return categories;
        },
        getKey: (category) => category.id,
        onInsert: async ({ transaction, collection }) => {
          const values = transaction.mutations[0].modified;

          const newCategory = await orpc.category.commands.create.call({
            name: values.name,
            description: values.description ?? "",
          });

          collection.utils.writeInsert(newCategory);

          return {
            refetch: false,
          };
        },
        onUpdate: async ({ transaction, collection }) => {
          const original = transaction.mutations[0].original;
          const values = transaction.mutations[0].changes;

          const updatedCategory = await orpc.category.commands.update.call({
            id: original.id,
            name: values.name,
            description: values.description ?? "",
          });

          collection.utils.writeUpdate(updatedCategory);

          return {
            refetch: false,
          };
        },
        onDelete: async ({ transaction, collection }) => {
          const original = transaction.mutations[0].original;

          await orpc.category.commands.delete.call({
            id: original.id,
          });

          collection.utils.writeDelete(original);

          return {
            refetch: false,
          };
        },
      }),
    );
  },
);

export const categoriesCache = cache;

export function useCategoriesCollection() {
  const { collection, activeOrganization } = useCollection();

  const categoryCollection = useDbClient().collection(collection);

  if (!indexedCollections.has(collection.id)) {
    categoryCollection.createIndex((row) => row.createdAt);
    categoryCollection.createIndex((row) => row.name);
    indexedCollections.add(collection.id);
  }

  return { categoryCollection, activeOrganization };
}
