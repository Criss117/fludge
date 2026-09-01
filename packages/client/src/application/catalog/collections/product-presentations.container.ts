import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createResourceCollection } from "@fludge/client/shared/create-resource-collection";

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
      }),
    );
  },
);

export function useProductsPresentationsCollection() {
  const { collection, activeOrganization } = useCollection();

  const productPresentationsCollection = useDbClient().collection(collection);

  return { productPresentationsCollection, activeOrganization };
}
