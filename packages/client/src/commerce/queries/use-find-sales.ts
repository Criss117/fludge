import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useContainer } from "@fludge/client/providers/container.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import type { FindAllSalesFilters } from "../domain/sale.repository";

function normalizeFilters(filters?: FindAllSalesFilters) {
  return {
    customerId: filters?.customerId ? filters.customerId : undefined,
  };
}

export const { keys: salesKeys, useInvalidateQueries: useInvalidateSales } = keysGenerator({
  module: "commerce",
  resource: "sales",
  normalizeFilters,
});

export function useFindSales(filters?: FindAllSalesFilters) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseInfiniteQuery({
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
