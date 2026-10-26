import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { STATUES } from "@fludge/client/shared/use-filters";
import { useCallback, useMemo, useState } from "react";

const statusOptions = [STATUES.ACTIVE, STATUES.INACTIVE];

export function useProducts() {
  const { filters, ...rest } = useFilters();
  const [barcodeSearchIndex, setBarcodeSearchIndex] = useState(0);

  const handleBarcodeSearch = (barcode: string) => {
    setBarcodeSearchIndex((prev) => prev + 1);
    rest.setSearchQuery(barcode);
  };

  const isStatusSelected = (status: string) => {
    return filters.status === status;
  };

  return {
    actions: {
      ...rest,
      setBarcode: handleBarcodeSearch,
      isStatusSelected,
    },
    texts: {
      searchBar: {
        label: getI18nKey("screens.catalog.products.search.label"),
        placeholder: getI18nKey("screens.catalog.products.search.placeholder"),
      },
    },
    state: {
      filters,
      statusOptions,
      barcodeSearchIndex,
    },
  };
}

export function useProductsList() {
  const { filters } = useFilters();

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindProducts({
    searchQuery: filters.searchQuery,
    status: filters.status,
    orderBy: filters.orderBy,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    status: {
      items,
      hasNextPage,
      isFetchingNextPage,
    },
    actions: {
      handleEndReached,
    },
  };
}
