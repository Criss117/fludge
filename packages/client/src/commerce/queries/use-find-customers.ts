import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useContainer } from "@fludge/client/providers/container.provider";
import type { Filters } from "@fludge/client/shared/use-filters";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { SearchBlob } from "@fludge/utils/search-blob";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

function normalizeFilters(filters: Filters) {
  return {
    searchQuery: filters.searchQuery ? SearchBlob.normalize(filters.searchQuery) : undefined,
    status: filters.status,
    orderBy: filters.orderBy,
  };
}

export const { keys: customerKeys, useInvalidateQueries: useInvalidateCustomers } = keysGenerator({
  module: "commerce",
  resource: "customers",
  normalizeFilters,
});

export function useFindCustomers(filters: Filters) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters?.searchQuery ?? "");

  return useInfiniteQuery({
    queryKey: customerKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: async ({ pageParam }) =>
      unwrapResult(
        await commerceContainer.repositories.customerRepository.findAll(
          activeOrganization.id,
          pageParam,
          {
            searchQuery: normalizedQuery,
            status: filters.status,
            orderBy: filters.orderBy,
          },
        ),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFindCustomer(customerId: string) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: customerKeys.detail(activeOrganization.id, customerId),
    queryFn: async () =>
      unwrapResult(
        await commerceContainer.repositories.customerRepository.findOneById(
          activeOrganization.id,
          customerId,
        ),
      ),
  });
}
