import { useMutation } from "@tanstack/react-query";
import { useCategoriesCollection } from "../collections/categories.collection";
import type { CategorySchema } from "../form/category-form";

export function useCreateCategoryMutation() {
  const { categoryCollection, activeOrganization } = useCategoriesCollection();

  return useMutation({
    mutationKey: ["catalog", "category", "create"],
    mutationFn: async (values: CategorySchema) => {
      const now = new Date();

      const tx = categoryCollection.insert({
        name: values.name,
        description: values.description,
        createdAt: now,
        updatedAt: now,
        createdBy: "",
        id: crypto.randomUUID(),
        organizationId: activeOrganization.id,
        slug: values.name,
        status: "active",
      });

      await tx.isPersisted.promise;
    },
  });
}

export function useUpdateCategoryMutation() {
  const { categoryCollection } = useCategoriesCollection();

  return useMutation({
    mutationKey: ["catalog", "category", "update"],
    mutationFn: async (values: CategorySchema & { id: string }) => {
      const now = new Date();

      categoryCollection.update(values.id, (draft) => {
        draft.name = values.name;
        draft.description = values.description;
        draft.updatedAt = now;
      });
    },
  });
}

export function useDeleteCategoryMutation() {
  const { categoryCollection } = useCategoriesCollection();

  return useMutation({
    mutationKey: ["catalog", "category", "delete"],
    mutationFn: async (categoryId: string) => {
      const tx = categoryCollection.delete(categoryId);

      await tx.isPersisted.promise;
    },
  });
}
