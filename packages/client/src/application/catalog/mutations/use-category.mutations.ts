import { useMutation } from "@tanstack/react-query";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateCategories } from "../queries/use-find-categories";
import { useOrganization } from "@fludge/client/providers/organization.provider";

export function useCreateCategoryMutation() {
  const orpc = useOrpc();
  const invalidateCategories = useInvalidateCategories();
  const { catalogContainer } = useContainer();

  return useMutation(
    orpc.category.commands.create.mutationOptions({
      onSuccess: async (newCategory) => {
        await catalogContainer.repositories.categoryRepository.save(
          newCategory,
        );

        invalidateCategories.invalidateList();
      },
    }),
  );
}

export function useUpdateCategoryMutation() {
  const orpc = useOrpc();
  const invalidateCategories = useInvalidateCategories();
  const { catalogContainer } = useContainer();

  return useMutation(
    orpc.category.commands.update.mutationOptions({
      onSuccess: async (newCategory) => {
        await catalogContainer.repositories.categoryRepository.save(
          newCategory,
        );

        invalidateCategories.invalidateList();
      },
    }),
  );
}

export function useDeleteCategoryMutation() {
  const orpc = useOrpc();
  const invalidateCategories = useInvalidateCategories();
  const { catalogContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useMutation(
    orpc.category.commands.delete.mutationOptions({
      onSuccess: async (_, variables) => {
        await catalogContainer.repositories.categoryRepository.delete(
          activeOrganization.id,
          variables.id,
        );

        invalidateCategories.invalidateList();
      },
    }),
  );
}
