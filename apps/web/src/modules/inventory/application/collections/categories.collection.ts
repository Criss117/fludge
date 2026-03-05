import {
  createCollection,
  type Collection,
  type NonSingleResult,
} from "@tanstack/db";
import {
  queryCollectionOptions,
  type QueryCollectionUtils,
} from "@tanstack/query-db-collection";

import { orpc } from "@/integrations/orpc";
import { queryClient } from "@/integrations/tanstack-query";

export type Category = Awaited<
  ReturnType<typeof orpc.inventory.categories.findAll.call>
>[number] & {
  metadata?: {
    isPending?: boolean;
    actions?: {
      onUpdate?: "update" | "only-disable";
    };
  };
};

type CategoryCollection = Collection<
  Category,
  string | number,
  QueryCollectionUtils<Category, string | number, Category, unknown>,
  never,
  Category
> &
  NonSingleResult;

const collectionsCache = new Map<string, CategoryCollection>();

export function categoryCollectionBuilder(orgId: string) {
  if (!collectionsCache.has(orgId)) {
    const newCategoryCollection = createCollection(
      queryCollectionOptions<Category>({
        queryKey: ["organization", orgId, "categories"],
        queryFn: () => {
          return orpc.inventory.categories.findAll.call();
        },
        getKey: (p) => p.id,
        queryClient,

        onInsert: async ({ transaction, collection }) => {
          const values = transaction.mutations[0].modified;

          const cretedCategory = await orpc.inventory.categories.create.call({
            name: values.name,
            description: values.description,
          });

          collection.utils.writeInsert(cretedCategory);

          return { refetch: false };
        },

        onDelete: async ({ transaction, collection }) => {
          const values = transaction.mutations.map((m) => m.original.id);

          await orpc.inventory.categories.delete.call({
            ids: values,
          });

          collection.utils.writeDelete(values);

          return { refetch: false };
        },

        onUpdate: async ({ transaction, collection }) => {
          const values = transaction.mutations[0].changes;
          const categoryId = transaction.mutations[0].original.id;

          const updatedCategory = await orpc.inventory.categories.update.call({
            id: categoryId,
            name: values.name,
            description: values.description,
          });

          collection.utils.writeUpdate(updatedCategory);

          return { refetch: false };
        },
      }),
    );

    collectionsCache.set(orgId, newCategoryCollection);
  }

  return collectionsCache.get(orgId)!;
}
