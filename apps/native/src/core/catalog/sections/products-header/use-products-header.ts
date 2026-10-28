import { useFilters } from "@fludge/client/providers/filters.provider";
import type { StatusFilter } from "@fludge/client/shared/use-filters";
import { STATUES } from "@fludge/client/shared/use-filters";
import { getI18nKey } from "@fludge/utils/validators/shared";
import * as Haptics from "expo-haptics";

const statusOptions = [STATUES.ALL, STATUES.ACTIVE, STATUES.INACTIVE, STATUES.DISCONTINUED];

export function useProductsHeader() {
  const { filters, ...rest } = useFilters();

  const isStatusSelected = (status: string) => {
    return filters.status === status;
  };

  const setStatus = (s: StatusFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rest.setStatus(s);
  };

  return {
    actions: {
      ...rest,
      setStatus,
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
    },
  };
}
