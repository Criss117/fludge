import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import {
  createResourceCollection,
  indexedCollections,
} from "@fludge/client/shared/create-resource-collection";
import { BasicIndex } from "@tanstack/db";

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
        defaultIndexType: BasicIndex,
        autoIndex: "eager",
      }),
    );
  },
);

export const productsCache = cache;

export function useProductsCollection() {
  const { collection, activeOrganization } = useCollection();

  const productCollection = useDbClient().collection(collection);

  if (!indexedCollections.has(collection.id)) {
    productCollection.createIndex((row) => row.createdAt);
    productCollection.createIndex((row) => row.name);
    productCollection.createIndex((row) => row.searchBlob);
    productCollection.createIndex((row) => row.categoryId);
    indexedCollections.add(collection.id);
  }

  return { productCollection, activeOrganization };
}
