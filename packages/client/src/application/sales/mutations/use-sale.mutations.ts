import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { useContainer } from "@fludge/client/providers/container.provider";

export function useCreateSaleMutation() {
  const orpc = useOrpc();
  const { invalidateList, invalidateDetail } = useInvalidateProducts();
  const { catalogContainer } = useContainer();

  return useMutation(
    orpc.sale.commands.create.mutationOptions({
      onSuccess: async (data) => {
        await catalogContainer.repositories.productRepository.save(
          data.products,
        );

        invalidateList();
        data.products.forEach((p) => invalidateDetail(p.id));
      },
    }),
  );
}
