import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateCustomers } from "@fludge/client/application/customer/queries/use-find-customers";

export function useCreateSaleMutation() {
  const orpc = useOrpc();
  const invalidateProducts = useInvalidateProducts();
  const invalidateCustomers = useInvalidateCustomers();
  const { catalogContainer, customerContainer } = useContainer();

  return useMutation(
    orpc.sale.commands.create.mutationOptions({
      onSuccess: async (data) => {
        await catalogContainer.repositories.productRepository.save(
          data.products,
        );

        if (data.customer) {
          await customerContainer.repositories.customerRepository.save(
            data.customer,
          );
        }

        invalidateProducts.invalidateList();
        data.products.forEach((p) => invalidateProducts.invalidateDetail(p.id));
        invalidateCustomers.invalidateList();
        data.customer && invalidateCustomers.invalidateDetail(data.customer.id);
      },
    }),
  );
}
