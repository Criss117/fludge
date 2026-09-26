import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateCustomers } from "../queries/use-find-customers";
import { useInvalidateSales } from "../queries/use-find-sales";
import { useInvalidateProducts } from "@fludge/client/catalog/queries/use-find-products";

export function useCreateSaleMutation() {
  const orpc = useOrpc();
  const invalidateProducts = useInvalidateProducts();
  const invalidateCustomers = useInvalidateCustomers();
  const invalidateSales = useInvalidateSales();
  const { catalogContainer, commerceContainer } = useContainer();

  return useMutation(
    orpc.sale.commands.create.mutationOptions({
      onSuccess: async (data) => {
        await catalogContainer.repositories.productRepository.save(
          data.products,
        );

        if (data.customer) {
          await commerceContainer.repositories.customerRepository.save(
            data.customer,
          );
        }

        await commerceContainer.repositories.saleRepository.save(data.sale);

        invalidateProducts.invalidateList();
        data.products.forEach((p) => invalidateProducts.invalidateDetail(p.id));
        invalidateCustomers.invalidateList();
        data.customer && invalidateCustomers.invalidateDetail(data.customer.id);
        invalidateSales.invalidateList();
      },
    }),
  );
}
