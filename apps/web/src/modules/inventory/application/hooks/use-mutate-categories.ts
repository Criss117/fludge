import { useMutation } from "@tanstack/react-query";
import { useCategoriesCollection } from "./use-categories-collection";
import type {
  CreateCategorySchema,
  DeleteCategoriesSchema,
  UpdateCategorySchema,
} from "@fludge/utils/validators/categories.validators";

export function useMutateCategories() {
  const categoriesCollection = useCategoriesCollection();

  const create = useMutation({
    mutationKey: ["categories", "create"],
    mutationFn: async (values: CreateCategorySchema) => {
      const tx = categoriesCollection.insert({
        name: values.name,
        description: values.description,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        deletedAt: null,
        isActive: true,
        organizationId: "",
        updatedAt: new Date(),
        metadata: {
          isPending: true,
        },
      });

      await tx.isPersisted.promise;
    },
  });

  const update = useMutation({
    mutationKey: ["categories", "update"],
    mutationFn: async (values: UpdateCategorySchema) => {
      const tx = categoriesCollection.update(values.id, (draft) => {
        draft.name = values.name || draft.name;
        draft.description = values.description || draft.description;
      });

      await tx.isPersisted.promise;
    },
  });

  const remove = useMutation({
    mutationKey: ["categories", "remove"],
    mutationFn: async (values: DeleteCategoriesSchema) => {
      const tx = categoriesCollection.delete(values.ids);

      await tx.isPersisted.promise;
    },
  });

  return { create, update, remove };
}
