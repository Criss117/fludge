import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createResourceCollection } from "@fludge/client/shared/create-resource-collection";

const { useCollection, cache } = createResourceCollection(
  "products",
  ({ id, queryKey }, orpc) => {
    return collectionOptions(id, (client) =>
      queryCollectionOptions({
        id: id,
        queryKey: queryKey,
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        queryFn: async () => {
          const products = await orpc.product.queries.findAll.call();

          return products;
        },
        getKey: (r) => r.id,
      }),
    );
  },
);

export const productsCache = cache;

export function useProductsCollection() {
  const { collection, activeOrganization } = useCollection();

  const productCollection = useDbClient().collection(collection);

  return { productCollection, activeOrganization };
}
