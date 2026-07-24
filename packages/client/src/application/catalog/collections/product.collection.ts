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
  const productCollection = createCollection(
    queryCollectionOptions({
      queryClient,
      queryKey: ["organizations", organizationId, "products"],
      queryFn: async () => {
        const data = await orpc.products.queries.findAll.call();

        return data;
      },
      getKey: (item) => item.id,
      defaultIndexType: BasicIndex,
      onInsert: async ({ transaction, collection }) => {
        const newProduct = transaction.mutations[0].modified;

        const createdProduct = await orpc.products.commands.create.call({
          barcode: newProduct.barcode,
          categoryId: newProduct.categoryId,
          name: newProduct.name,
          description: newProduct.description,
          notes: newProduct.notes,
          stockQuantity: newProduct.stockQuantity,
          minimumStock: newProduct.minimumStock,
          allowNegativeStock: newProduct.allowNegativeStock,
          presentation: newProduct.presentations.map((p) => ({
            name: p.name,
            barcode: p.barcode,
            unitLabel: p.unitLabel,
            conversionFactor: p.conversionFactor,
            priceRetail: p.priceRetail,
            pricePurchase: p.pricePurchase,
            priceWholesale: p.priceWholesale,
          })),
        });

        collection.utils.writeInsert(createdProduct);

        return {
          refetch: false,
        };
      },

      onDelete: async ({ transaction, collection }) => {
        const productIds = transaction.mutations.map((m) => m.original.id);

        await orpc.products.commands.delete.call({ productIds });

        collection.utils.writeDelete(productIds);

        return {
          refetch: false,
        };
      },
    }),
  );

  productCollection.createIndex((row) => row.name);
  productCollection.createIndex((row) => row.slug);
  productCollection.createIndex((row) => row.id);
  productCollection.createIndex((row) => row.barcode);
  productCollection.createIndex((row) => row.categoryId);

  return productCollection;
}

export function productCollectionBuilder(
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
