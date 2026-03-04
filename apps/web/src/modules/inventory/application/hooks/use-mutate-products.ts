import { useMutation } from "@tanstack/react-query";
import type {
  CreateProductSchema,
  DeleteProductsSchema,
  UpdateProductSchema,
} from "@fludge/utils/validators/products.schemas";
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
        categoryId: null,
        deletedAt: null,
        supplierId: null,
        metadata: { isPending: true },
      });

      await tx.isPersisted.promise;
    },
  });

  const update = useMutation({
    mutationKey: ["products", "update"],
    mutationFn: async (values: UpdateProductSchema) => {
      const tx = productCollection.update(
        values.id,
        { metadata: { reason: "user update" } },
        (draft) => {
          draft.sku = values.sku || draft.sku;
          draft.name = values.name || draft.name;
          draft.description = values.description || draft.description;
          draft.wholesalePrice = values.wholesalePrice || draft.wholesalePrice;
          draft.salePrice = values.salePrice || draft.salePrice;
          draft.costPrice = values.costPrice || draft.costPrice;
          draft.stock = values.stock || draft.stock;
          draft.minStock = values.minStock || draft.minStock;
          draft.updatedAt = new Date();
        },
      );

      await tx.isPersisted.promise;
    },
  });

  const remove = useMutation({
    mutationKey: ["products", "delete"],
    mutationFn: async (productIds: string[]) => {
      const tx = productCollection.delete(productIds);

      await tx.isPersisted.promise;
    },
  });

  const toggleDisabled = useMutation({
    mutationKey: ["products", "toggleDisabled"],
    mutationFn: async (productId: string) => {
      const tx = productCollection.update(productId, (draft) => {
        draft.isActive = !draft.isActive;
      });

      await tx.isPersisted.promise;
    },
  });

  return { create, update, remove, toggleDisabled };
}
