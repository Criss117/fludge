import { useMutation } from "@tanstack/react-query";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateCustomers } from "../queries/use-find-customers";

export function useCreateCustomerMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const { customerContainer } = useContainer();

  return useMutation(
    orpc.customer.commands.create.mutationOptions({
      onSuccess: async (newCustomer) => {
        await customerContainer.repositories.customerRepository.save(
          newCustomer,
        );

        invalidateCustomers.invalidateList();
      },
    }),
  );
}

export function useUpdateCustomerMutation() {
  const orpc = useOrpc();
  const invalidateCustomers = useInvalidateCustomers();
  const { customerContainer } = useContainer();

  return useMutation(
    orpc.customer.commands.update.mutationOptions({
      onSuccess: async (updatedCustomer) => {
        await customerContainer.repositories.customerRepository.save(
          updatedCustomer,
        );

        invalidateCustomers.invalidateList();
        invalidateCustomers.invalidateDetail(updatedCustomer.id);
      },
    }),
  );
}