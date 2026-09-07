import { createOptimisticAction } from "@tanstack/react-db";
import { useProductsCollection } from "../collections/products.collection";
import { useProductsPresentationsCollection } from "../collections/product-presentations.container";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import type { ProductFormSchema } from "../form/product-form";

export function useCreateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const orpc = useOrpc();

  return createOptimisticAction<ProductFormSchema>({
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

export function useUpdateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const orpc = useOrpc();

  return createOptimisticAction<ProductFormSchema>({
    onMutate: (input) => {
      const now = new Date();

      productCollection.update(input.id, (draft) => {
        draft.name = input.name;
        draft.description = input.description;
        draft.searchBlob = input.name;
        draft.slug = input.name;
        draft.categoryId = input.categoryId;
        draft.totalPresentations = input.presentations.length;

        draft.stock = input.stock;
        draft.minStock = input.minStock;
        draft.allowNegativeStock = input.allowNegativeStock;

        draft.updatedAt = now;
        draft.status = input.status;
      });

      for (const presentation of input.presentations) {
        if (presentation.delete) {
          productPresentationsCollection.delete(presentation.id);

          continue;
        }

        const existing = productPresentationsCollection.get(presentation.id);

        if (existing) {
          productPresentationsCollection.update(presentation.id, (draft) => {
            draft.barcode = presentation.barcode;
            draft.conversionFactor = presentation.conversionFactor;
            draft.name = presentation.name;
            draft.priceSale = presentation.priceSale;
            draft.pricePurchase = presentation.pricePurchase;
            draft.priceWholesale = presentation.priceWholesale;
            draft.status = presentation.status;

            draft.searchBlob = presentation.name;
            draft.updatedAt = now;
          });

          continue;
        }

        productPresentationsCollection.insert({
          id: presentation.id,
          name: presentation.name,
          barcode: presentation.barcode,
          conversionFactor: presentation.conversionFactor,
          priceSale: presentation.priceSale,
          pricePurchase: presentation.pricePurchase,
          priceWholesale: presentation.priceWholesale,
          searchBlob: presentation.name,
          productId: input.id,
          organizationId: activeOrganization.id,
          createdAt: now,
          updatedAt: now,
          createdBy: "",
          status: "active",
        });
      }
    },
    mutationFn: async (input) => {
      const response = await orpc.product.commands.update.call(input);

      const { presentations, ...product } = response;

      productCollection.utils.writeUpdate({
        ...product,
        totalPresentations: presentations.length,
      });

      productPresentationsCollection.utils.writeDelete(
        input.presentations.filter((p) => p.delete).map((p) => p.id),
      );

      for (const presentation of presentations) {
        const existing = productPresentationsCollection.get(presentation.id);

        if (existing) {
          productPresentationsCollection.utils.writeUpdate(presentation);

          continue;
        }

        productPresentationsCollection.utils.writeInsert(presentation);

        await Promise.resolve();
      }

      return response;
    },
  });
}
