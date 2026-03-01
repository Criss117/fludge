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
      }),
    );

    collectionsCache.set(orgId, newProductCollection);
  }

  return collectionsCache.get(orgId)!;
}
