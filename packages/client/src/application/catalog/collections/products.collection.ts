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
        onInsert: async ({ collection, transaction }) => {
          const values = transaction.mutations[0].modified;

          const response = await orpc.product.commands.create.call({
            name: values.name,
            description: values.description,
            categoryId: values.categoryId ?? "",
            stock: values.stock,
            allowNegativeStock: values.allowNegativeStock,
            minStock: values.minStock,
            presentations: values.presentations.map((p) => ({
              barcode: p.barcode ?? "",
              conversionFactor: p.conversionFactor,
              name: p.name,
              priceSale: p.priceSale,
              pricePurchase: p.pricePurchase ?? 0,
              priceWholesale: p.priceWholesale ?? 0,
            })),
          });

          collection.utils.writeInsert(response);

          return {
            refetch: false,
          };
        },
        onUpdate: async ({ transaction, collection }) => {
          const modified = transaction.mutations[0].modified;

          const updatedCategory = await orpc.product.commands.update.call({
            id: modified.id,
            name: modified.name,
            description: modified.description,
            categoryId: modified.categoryId ?? "",
            stock: modified.stock,
            allowNegativeStock: modified.allowNegativeStock,
            minStock: modified.minStock,
            status: modified.status,
            presentations: modified.presentations.map((p) => ({
              id: p.id,
              barcode: p.barcode ?? "",
              conversionFactor: p.conversionFactor,
              name: p.name,
              priceSale: p.priceSale,
              pricePurchase: p.pricePurchase ?? 0,
              priceWholesale: p.priceWholesale ?? 0,
              status: p.status,
            })),
          });

          collection.utils.writeUpdate(updatedCategory);

          return {
            refetch: false,
          };
        },
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
