import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useInvalidateProducts } from "../queries/use-find-products";
import { useMutation } from "@tanstack/react-query";

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
