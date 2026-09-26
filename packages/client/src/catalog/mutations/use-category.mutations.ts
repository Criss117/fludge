import { useMutation } from "@tanstack/react-query";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateCategories } from "../queries/use-find-categories";

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

export function useToggleCategoryStatusMutation() {
  const orpc = useOrpc();
  const invalidateCategories = useInvalidateCategories();
  const { catalogContainer } = useContainer();

  return useMutation(
    orpc.category.commands.toggleStatus.mutationOptions({
      onSuccess: async (newCategory) => {
        await catalogContainer.repositories.categoryRepository.save(
          newCategory,
        );

        invalidateCategories.invalidateList();
      },
    }),
  );
}
