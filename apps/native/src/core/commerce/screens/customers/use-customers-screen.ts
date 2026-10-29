import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFindCustomers } from "@fludge/client/commerce/queries/use-find-customers";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { useCallback, useMemo } from "react";

export function useCustomersScreen() {
  const { filters } = useFilters();
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useFindCustomers(filters);

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    actions: {
      handleEndReached,
    },
    texts: {
      noMore: getI18nKey("screens.customers.no_more"),
    },
    state: {
      items,
      hasNextPage,
      isFetchingNextPage,
      isFetching,
    },
  };
}
