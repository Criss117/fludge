import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFindSales } from "@fludge/client/commerce/queries/use-find-sales";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { useCallback, useMemo } from "react";

export function useSalesScreen() {
  const { filters } = useFilters();
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } = useFindSales({
    customerId: null,
    ...filters,
  });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    actions: {
      handleEndReached,
    },
    texts: {
      noMore: getI18nKey("screens.sales.list.no_more"),
    },
    state: {
      items,
      hasNextPage,
      isFetchingNextPage,
      isFetching,
    },
  };
}
