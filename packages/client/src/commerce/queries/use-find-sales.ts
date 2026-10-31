import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useContainer } from "@fludge/client/providers/container.provider";
import type { Filters } from "@fludge/client/shared/use-filters";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { SearchBlob } from "@fludge/utils/search-blob";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useInfiniteQuery } from "@tanstack/react-query";

type SaleFilters = Filters & {
  customerId: string | null;
};

function normalizeFilters(filters: SaleFilters) {
  return {
    searchQuery: filters.searchQuery ? SearchBlob.normalize(filters.searchQuery) : undefined,
    status: filters.status,
    orderBy: filters.orderBy,
    customerId: filters.customerId,
  };
}

export const { keys: salesKeys, useInvalidateQueries: useInvalidateSales } = keysGenerator({
  module: "commerce",
  resource: "sales",
  normalizeFilters,
});

export function useFindSales(filters: SaleFilters) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useInfiniteQuery({
    queryKey: salesKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: async ({ pageParam }) =>
      unwrapResult(
        await commerceContainer.repositories.saleRepository.findAll(
          activeOrganization.id,
          pageParam,
          filters,
        ),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
