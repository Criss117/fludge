import type { FindCustomerPaymentsFilters } from "@fludge/client/commerce/domain/customer.repository";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useContainer } from "@fludge/client/providers/container.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useInfiniteQuery } from "@tanstack/react-query";

function normalizeFilters(filters: FindCustomerPaymentsFilters) {
  return {
    customerId: filters.customerId,
  };
}

export const { keys: customerPaymnetKeys, useInvalidateQueries: useInvalidateCustomerPayments } =
  keysGenerator({
    module: "commerce",
    resource: "customer-payments",
    normalizeFilters,
  });

export function useFindCustomerPayments({ customerId }: FindCustomerPaymentsFilters) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useInfiniteQuery({
    queryKey: customerPaymnetKeys.filteredList(activeOrganization.id, {
      customerId,
    }),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: async ({ pageParam }) =>
      unwrapResult(
        await commerceContainer.repositories.customerRepository.findCustomerPayments(
          activeOrganization.id,
          pageParam,
          {
            customerId,
          },
        ),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
