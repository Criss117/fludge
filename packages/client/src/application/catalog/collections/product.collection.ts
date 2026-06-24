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
      onInsert: async ({ transaction }) => {
        const newProduct = transaction.mutations[0].modified;

        await orpc.products.commands.create.call({
          name: newProduct.name,
          barcode: newProduct.barcode,
          description: newProduct.description ?? undefined,
          imageUrl: newProduct.imageUrl ?? undefined,
          categoryId: newProduct.categoryId ?? undefined,
          sku: newProduct.sku ?? undefined,
          priceRetail: newProduct.priceRetail,
          pricePurchase: newProduct.pricePurchase,
          priceWholesale: newProduct.priceWholesale,
          minimumStock: newProduct.minimumStock ?? undefined,
          allowNegativeStock: newProduct.allowNegativeStock ?? undefined,
        });

        return {
          refetch: true,
        };
      },

      onUpdate: async ({ transaction }) => {
        const originalProduct = transaction.mutations[0].original;
        const modifiedProduct = transaction.mutations[0].modified;

        await orpc.products.commands.update.call({
          id: originalProduct.id,
          name: modifiedProduct.name,
          barcode: modifiedProduct.barcode,
          description: modifiedProduct.description ?? undefined,
          imageUrl: modifiedProduct.imageUrl ?? undefined,
          categoryId: modifiedProduct.categoryId ?? undefined,
          sku: modifiedProduct.sku ?? undefined,
          priceRetail: modifiedProduct.priceRetail,
          pricePurchase: modifiedProduct.pricePurchase,
          priceWholesale: modifiedProduct.priceWholesale,
          minimumStock: modifiedProduct.minimumStock ?? undefined,
          allowNegativeStock: modifiedProduct.allowNegativeStock ?? undefined,
          status: modifiedProduct.status ?? undefined,
          stockQuantity: modifiedProduct.stockQuantity ?? undefined,
        });

        return {
          refetch: true,
        };
      },

      onDelete: async ({ transaction }) => {
        const productIds = transaction.mutations.map(
          (m) => m.original.id,
        );

        await orpc.products.commands.delete.call({ productIds });

        productCollection.utils.writeDelete(productIds);

        return {
          refetch: false,
        };
      },
    }),
  );

  productCollection.createIndex((row) => row.name);
  productCollection.createIndex((row) => row.slug);
  productCollection.createIndex((row) => row.id);
  productCollection.createIndex((row) => row.sku);
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
