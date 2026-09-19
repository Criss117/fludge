import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export const { keys: salesKeys, useInvalidateQueries: useInvalidateSales } =
  keysGenerator({
    module: "sales",
    resource: "sales",
    normalizeFilters: (f: string) => f,
  });

export function useFindSales(filters: string) {
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
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
