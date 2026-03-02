import { useMutation } from "@tanstack/react-query";
import type { CreateProductSchema } from "@fludge/utils/validators/products.schemas";
import { useProductsCollection } from "./use-products-collection";

export function useMutateProducts() {
  const productCollection = useProductsCollection();

  const create = useMutation({
    mutationKey: ["products", "create"],
    mutationFn: async (values: CreateProductSchema) => {
      const tx = productCollection.insert({
        ...values,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: "",
        isActive: true,
        isPending: true,
        categoryId: null,
        deletedAt: null,
        supplierId: null,
      });

      await tx.isPersisted.promise;
    },
  });

  return { create };
}
