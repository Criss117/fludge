import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useInvalidateProducts } from "../queries/use-find-products";
import { useMutation } from "@tanstack/react-query";
import { useOrganization } from "@fludge/client/providers/organization.provider";

export function useCreateProductMutation() {
  const orpc = useOrpc();
  const { catalogContainer } = useContainer();
  const invalidateProducts = useInvalidateProducts();

  return useMutation(
    orpc.product.commands.create.mutationOptions({
      onSuccess: async (newProduct) => {
        await catalogContainer.repositories.productRepository.save(newProduct);

        invalidateProducts.invalidateList();
      },
    }),
  );
}

export function useUpdateProductMutation() {
  const orpc = useOrpc();
  const { catalogContainer } = useContainer();
  const invalidateProducts = useInvalidateProducts();

  return useMutation(
    orpc.product.commands.update.mutationOptions({
      onSuccess: async (newProduct) => {
        await catalogContainer.repositories.productRepository.save(newProduct);

        invalidateProducts.invalidateList();
        invalidateProducts.invalidateDetail(newProduct.id);
      },
    }),
  );
}

export function useDeleteProductMutation() {
  const orpc = useOrpc();
  const { catalogContainer } = useContainer();
  const invalidateProducts = useInvalidateProducts();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useMutation(
    orpc.product.commands.delete.mutationOptions({
      onSuccess: async (_, variables) => {
        await catalogContainer.repositories.productRepository.delete(
          activeOrganization.id,
          variables.id,
        );

        invalidateProducts.invalidateList();
      },
    }),
  );
}
