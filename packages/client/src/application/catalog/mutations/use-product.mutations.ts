import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";

import { useMutation } from "@tanstack/react-query";
import type { ProductDetail } from "@fludge/client/application/catalog/queries/use-find-products";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import { getI18nKey } from "@fludge/utils/validators/shared";

function generateNewPresentation(
  activeOrganizationId: string,
  productId: string,
  values: ProductFormSchema["presentations"][number],
): ProductDetail["presentations"][number] {
  const now = new Date();
  return {
    id: values.id,
    barcode: values.barcode,
    name: values.name,
    searchBlob: values.name,
    conversionFactor: values.conversionFactor,
    pricePurchase: values.pricePurchase,
    priceSale: values.priceSale,
    priceWholesale: values.priceWholesale,
    organizationId: activeOrganizationId,
    createdBy: "",
    createdAt: now,
    updatedAt: now,
    status: "active",
    productId: productId,
  };
}

export function useCreateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();

  // react-doctor-disable-next-line query-mutation-missing-invalidation -- TanStack DB persists this local collection mutation directly.
  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (input: ProductFormSchema) => {
      const productId = crypto.randomUUID();
      const now = new Date();

      const { presentations, ...product } = input;

      const correctedPresentations = presentations.filter((p) => !p.isDeleted);

      if (correctedPresentations.length === 0)
        throw new Error(
          getI18nKey("api_errors.catalog.products.no_has_barcode"),
        );

      const tx = productCollection.insert({
        id: productId,

        name: product.name,
        searchBlob: product.name,
        slug: product.name,
        description: product.description,
        categoryId: product.categoryId,

        stock: product.stock,
        allowNegativeStock: product.allowNegativeStock,
        minStock: product.minStock,

        organizationId: activeOrganization.id,
        createdBy: "",
        createdAt: now,
        updatedAt: now,
        status: "active",

        presentations: correctedPresentations.map((p) =>
          generateNewPresentation(activeOrganization.id, productId, p),
        ),
      });

      await tx.isPersisted.promise;
    },
  });
}

export function useUpdateProductMutation() {
  const { productCollection, activeOrganization } = useProductsCollection();

  // react-doctor-disable-next-line query-mutation-missing-invalidation -- TanStack DB persists this local collection mutation directly.
  return useMutation({
    mutationKey: ["update-product"],
    mutationFn: async (input: ProductFormSchema & { id: string }) => {
      console.log("UPDATE: init");
      const now = new Date();

      const exisiting = productCollection.get(input.id);

      if (!exisiting)
        throw new Error(getI18nKey("api_errors.catalog.products.not_found"));

      const newPresentations: ProductDetail["presentations"] = [];
      const existingPresentations = new Map(
        exisiting.presentations.map((presentation) => [
          presentation.id,
          presentation,
        ]),
      );

      for (const pres of input.presentations) {
        if (pres.isDeleted) continue;

        const existingPresentation = existingPresentations.get(pres.id);

        if (!existingPresentation) {
          newPresentations.push(
            generateNewPresentation(activeOrganization.id, input.id, pres),
          );

          continue;
        }

        newPresentations.push({
          ...existingPresentation,
          name: pres.name,
          searchBlob: pres.name,
          barcode: pres.barcode,
          conversionFactor: pres.conversionFactor,
          pricePurchase: pres.pricePurchase,
          priceSale: pres.priceSale,
          priceWholesale: pres.priceWholesale,
          status: pres.status,
          updatedAt: now,
        });
      }

      const tx = productCollection.update(input.id, (draft) => {
        draft.name = input.name;
        draft.description = input.description;
        draft.searchBlob = input.name;
        draft.slug = input.name;
        draft.categoryId = input.categoryId;

        draft.stock = input.stock;
        draft.minStock = input.minStock;
        draft.allowNegativeStock = input.allowNegativeStock;

        draft.updatedAt = now;
        draft.status = input.status;

        draft.presentations = newPresentations;
      });

      await tx.isPersisted.promise;
    },
  });
}

export function useDeleteProductMutation() {
  const { productCollection } = useProductsCollection();

  // react-doctor-disable-next-line query-mutation-missing-invalidation -- TanStack DB persists this local collection mutation directly.
  return useMutation({
    mutationKey: ["delete-product"],
    mutationFn: async (input: { id: string }) => {
      const tx = productCollection.delete(input.id);

      await tx.isPersisted.promise;
    },
  });
}
