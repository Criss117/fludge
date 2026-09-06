import { createOptimisticAction } from "@tanstack/react-db";
import { useProductsCollection } from "../collections/products.collection";
import { useProductsPresentationsCollection } from "../collections/product-presentations.container";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import type { CreateProductSchema } from "../form/product-form";

export function useCreateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const orpc = useOrpc();

  return createOptimisticAction<CreateProductSchema>({
    onMutate: (input) => {
      const productId = crypto.randomUUID();
      const now = new Date();

      productCollection.insert({
        id: productId,
        name: input.name,
        description: input.description,
        stock: input.stock,
        allowNegativeStock: input.allowNegativeStock,
        minStock: input.minStock,
        categoryId: input.categoryId,
        searchBlob: input.name,
        totalPresentations: input.presentations.length,
        createdAt: now,
        updatedAt: now,
        createdBy: "",
        organizationId: activeOrganization.id.toString(),
        slug: input.name,
        status: "active",
      });

      productPresentationsCollection.insert(
        input.presentations.map((item) => ({
          id: crypto.randomUUID(),
          name: item.name,
          barcode: item.barcode,
          conversionFactor: item.conversionFactor,
          priceSale: item.priceSale,
          pricePurchase: item.pricePurchase,
          priceWholesale: item.priceWholesale,
          searchBlob: item.name,
          productId: productId,
          organizationId: activeOrganization.id.toString(),
          createdAt: now,
          updatedAt: now,
          createdBy: "",
          status: "active",
        })),
      );
    },
    mutationFn: async (input) => {
      const response = await orpc.product.commands.create.call(input);

      const { presentations, ...product } = response;

      productCollection.utils.writeInsert({
        ...product,
        totalPresentations: presentations.length,
      });
      productPresentationsCollection.utils.writeInsert(presentations);

      return response;
    },
  });
}
