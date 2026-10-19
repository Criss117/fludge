import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useNetworkMutation } from "@fludge/client/shared/use-network-mutation";
import { unwrapResult } from "@fludge/utils/trycatch";

import { useInvalidateCustomers } from "../queries/use-find-customers";
import { useInvalidateSales } from "../queries/use-find-sales";

export function useCreateCustomerMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const { commerceContainer } = useContainer();

  return useNetworkMutation(
    orpc.customer.commands.create.mutationOptions({
      onSuccess: async (newCustomer) => {
        unwrapResult(await commerceContainer.repositories.customerRepository.save(newCustomer));

        invalidateCustomers.invalidateList();
      },
    }),
  );
}

export function useUpdateCustomerMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const { commerceContainer } = useContainer();

  return useNetworkMutation(
    orpc.customer.commands.update.mutationOptions({
      onSuccess: async (updatedCustomer) => {
        unwrapResult(await commerceContainer.repositories.customerRepository.save(updatedCustomer));

        invalidateCustomers.invalidateList();
        invalidateCustomers.invalidateDetail(updatedCustomer.id);
      },
    }),
  );
}

export function useCreateCustomerPaymentMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const invalidateSales = useInvalidateSales();
  const { commerceContainer } = useContainer();

  return useNetworkMutation(
    orpc.customer.commands.createPayment.mutationOptions({
      onSuccess: async ({ customer, sales }) => {
        unwrapResult(await commerceContainer.repositories.customerRepository.save(customer));
        unwrapResult(await commerceContainer.repositories.saleRepository.save(sales));

        invalidateCustomers.invalidateList();
        invalidateCustomers.invalidateDetail(customer.id);

        invalidateSales.invalidateList();
        sales.forEach((sale) => {
          invalidateSales.invalidateDetail(sale.id);
        });
      },
    }),
  );
}

export function useCancelCustomerPaymentMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const invalidateSales = useInvalidateSales();
  const { commerceContainer } = useContainer();

  return useNetworkMutation(
    orpc.customer.commands.cancelPayment.mutationOptions({
      onSuccess: async ({ customer, sales }) => {
        unwrapResult(await commerceContainer.repositories.saleRepository.save(sales));
        unwrapResult(await commerceContainer.repositories.customerRepository.save(customer));

        invalidateCustomers.invalidateList();
        invalidateCustomers.invalidateDetail(customer.id);

        invalidateSales.invalidateList();
        sales.forEach((sale) => {
          invalidateSales.invalidateDetail(sale.id);
        });
      },
    }),
  );
}
