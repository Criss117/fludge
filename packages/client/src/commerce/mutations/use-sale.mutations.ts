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

export function useCancelSaleMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const invalidateSales = useInvalidateSales();
  const invalidateProducts = useInvalidateProducts();
  const { commerceContainer, catalogContainer } = useContainer();

  return useMutation(
    orpc.sale.commands.cancel.mutationOptions({
      onSuccess: async ({ customer, products, sale }) => {
        await catalogContainer.repositories.productRepository.save(products);
        await commerceContainer.repositories.saleRepository.save(sale);

        if (customer) {
          await commerceContainer.repositories.customerRepository.save(
            customer,
          );
        }

        if (customer) {
          invalidateCustomers.invalidateList();
          invalidateCustomers.invalidateDetail(customer.id);
        }

        invalidateSales.invalidateList();
        invalidateSales.invalidateDetail(sale.id);

        invalidateProducts.invalidateList();
        products.forEach((p) => invalidateProducts.invalidateDetail(p.id));
      },
    }),
  );
}

export function useRefundSaleItemsMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const invalidateSales = useInvalidateSales();
  const invalidateProducts = useInvalidateProducts();
  const { commerceContainer, catalogContainer } = useContainer();

  return useMutation(
    orpc.sale.commands.refundItems.mutationOptions({
      onSuccess: async ({ customer, products, sale }) => {
        await catalogContainer.repositories.productRepository.save(products);
        await commerceContainer.repositories.saleRepository.save(sale);

        if (customer) {
          await commerceContainer.repositories.customerRepository.save(
            customer,
          );
        }

        if (customer) {
          invalidateCustomers.invalidateList();
          invalidateCustomers.invalidateDetail(customer.id);
        }

        invalidateSales.invalidateList();
        invalidateSales.invalidateDetail(sale.id);

        invalidateProducts.invalidateList();
        products.forEach((p) => invalidateProducts.invalidateDetail(p.id));
      },
    }),
  );
}
