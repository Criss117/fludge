import { createOptimisticAction } from "@tanstack/react-db";
import { useProductsCollection } from "../collections/products.collection";
import { useProductsPresentationsCollection } from "../collections/product-presentations.container";
import { useOrpc } from "@fludge/client/providers/orpc.provider";

type CreateProductInput = {
  name: string;
  categoryId?: string | undefined;
  description?: string | undefined;
  stock: number;
  allowNegativeStock: boolean;
  minStock: number;
  presentations: {
    name: string;
    barcode?: string | undefined;
    conversionFactor: number;
    pricePurchase?: number | undefined;
    priceSale: number;
    priceWholesale?: number | undefined;
  }[];
};

export function useCreateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const orpc = useOrpc();

  return createOptimisticAction<CreateProductInput>({
    onMutate: (input) => {
      const productId = crypto.randomUUID();
      const now = new Date();

      productCollection.insert({
        id: productId,
        name: input.name,
        description: input.description ?? "",
        stock: input.stock,
        allowNegativeStock: input.allowNegativeStock,
        minStock: input.minStock,
        categoryId: input.categoryId ?? null,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        organizationId: activeOrganization.id.toString(),
        searchName: input.name,
        slug: input.name,
        status: "active",
      });

      productPresentationsCollection.insert(
        input.presentations.map((item) => ({
          id: crypto.randomUUID(),
          name: item.name,
          barcode: item.barcode ?? null,
          conversionFactor: item.conversionFactor,
          pricePurchase: item.pricePurchase ?? null,
          priceSale: item.priceSale,
          priceWholesale: item.priceWholesale ?? null,
          productId: productId,
          organizationId: activeOrganization.id.toString(),
          createdAt: now,
          updatedAt: now,
          createdBy: null,
          searchName: item.name,
          status: "active",
        })),
      );
    },
    mutationFn: async (input) => {
      const response = await orpc.product.commands.create.call(input);

      const { presentations, ...product } = response;

      productCollection.utils.writeInsert(product);
      productPresentationsCollection.utils.writeInsert(presentations);

      return response;
    },
  });
}
