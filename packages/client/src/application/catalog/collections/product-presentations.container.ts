import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { BasicIndex, collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import {
  createResourceCollection,
  indexedCollections,
} from "@fludge/client/shared/create-resource-collection";
import type { OrpcQueryClient } from "@fludge/client/providers/orpc.provider";

export type ProductPresentationSummary = Awaited<
  ReturnType<
    OrpcQueryClient["product"]["queries"]["findAllPresentations"]["call"]
  >
>[number];

const { useCollection } = createResourceCollection(
  "products-presentations",
  ({ id, queryKey }, orpc) => {
    return collectionOptions(id, (client) =>
      queryCollectionOptions({
        id: id,
        queryKey: queryKey,
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        queryFn: async () => {
          const data = await orpc.product.queries.findAllPresentations.call();

          return data;
        },
        getKey: (r) => r.id,
        defaultIndexType: BasicIndex,
        autoIndex: "eager",
      }),
    );
  },
);

export function useProductsPresentationsCollection() {
  const { collection, activeOrganization } = useCollection();

  const productPresentationsCollection = useDbClient().collection(collection);

  if (!indexedCollections.has(collection.id)) {
    productPresentationsCollection.createIndex((row) => row.createdAt);
    productPresentationsCollection.createIndex((row) => row.name);
    productPresentationsCollection.createIndex((row) => row.searchBlob);
    productPresentationsCollection.createIndex((row) => row.barcode);
    productPresentationsCollection.createIndex((row) => row.productId);
    indexedCollections.add(collection.id);
  }

  return { productPresentationsCollection, activeOrganization };
}
