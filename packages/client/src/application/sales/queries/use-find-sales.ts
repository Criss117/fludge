import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import type { FindAllSalesFilters } from "@fludge/client/application/sales/domain/sale.repository";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

function normalizeFilters(filters: FindAllSalesFilters) {
  return {
    customerId: filters.customerId,
  };
}

export const { keys: salesKeys, useInvalidateQueries: useInvalidateSales } =
  keysGenerator({
    module: "sales",
    resource: "sales",
    normalizeFilters,
  });

export function useFindSales(filters: FindAllSalesFilters) {
  const { salesContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseInfiniteQuery({
    queryKey: salesKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: ({ pageParam }) =>
      salesContainer.repositories.saleRepository.findAll(
        activeOrganization.id,
        pageParam,
        filters,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
