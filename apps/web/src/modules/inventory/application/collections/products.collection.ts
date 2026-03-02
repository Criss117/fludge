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

export type Product = Awaited<
  ReturnType<typeof orpc.inventory.products.findMany.call>
>[number] & {
  isPending?: boolean;
};

type ProductCollection = Collection<
  Product,
  string | number,
  QueryCollectionUtils<Product, string | number, Product, unknown>,
  never,
  Product
> &
  NonSingleResult;

const collectionsCache = new Map<string, ProductCollection>();

export function productCollectionBuilder(orgId: string) {
  if (!collectionsCache.has(orgId)) {
    const newProductCollection = createCollection(
      queryCollectionOptions<Product>({
        queryKey: ["organization", orgId, "products"],
        queryFn: () => {
          return orpc.inventory.products.findMany.call();
        },
        getKey: (p) => p.id,
        queryClient,

        onInsert: async ({ transaction, collection }) => {
          const values = transaction.mutations[0].modified;

          const cretedProduct = await orpc.inventory.products.create.call({
            costPrice: values.costPrice,
            name: values.name,
            description: values.description || "",
            minStock: values.minStock,
            salePrice: values.salePrice,
            sku: values.sku,
            stock: values.stock,
            wholesalePrice: values.wholesalePrice,
          });

          collection.utils.writeInsert(cretedProduct);

          return { refetch: false };
        },

        onUpdate: async ({ transaction, collection }) => {
          const values = transaction.mutations[0].changes;
          const productId = transaction.mutations[0].original.id;

          const updatedProduct = await orpc.inventory.products.update.call({
            id: productId,
            costPrice: values.costPrice,
            name: values.name,
            description: values.description ?? undefined,
            minStock: values.minStock,
            salePrice: values.salePrice,
            sku: values.sku,
            stock: values.stock,
            wholesalePrice: values.wholesalePrice,
          });

          collection.utils.writeUpdate(updatedProduct);

          return { refetch: false };
        },
      }),
    );

    collectionsCache.set(orgId, newProductCollection);
  }

  return collectionsCache.get(orgId)!;
}
