import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { useCallback, useMemo } from "react";

export function useProductsScreen() {
  const { filters } = useFilters();
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } = useFindProducts({
    searchQuery: filters.searchQuery,
    status: filters.status,
    orderBy: filters.orderBy,
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
      noMore: getI18nKey("screens.catalog.products.no_more"),
    },
    state: {
      items,
      hasNextPage,
      isFetchingNextPage,
      isFetching,
    },
  };
}
