import { useFilters } from "@fludge/client/providers/filters.provider";
import type { StatusFilter } from "@fludge/client/shared/use-filters";
import { SALE_STATUSES, STATUES } from "@fludge/client/shared/use-filters";
import { getI18nKey } from "@fludge/utils/validators/shared";
import * as Haptics from "expo-haptics";

const statusOptions = [
  STATUES.ALL,
  SALE_STATUSES.OPEN,
  SALE_STATUSES.PARTIAL,
  SALE_STATUSES.COMPLETED,
  SALE_STATUSES.CANCELLED,
];

export function useSalesHeader() {
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
        label: getI18nKey("screens.sales.search.label"),
        placeholder: getI18nKey("screens.sales.search.placeholder"),
      },
    },
    state: {
      filters,
      statusOptions,
    },
  };
}
