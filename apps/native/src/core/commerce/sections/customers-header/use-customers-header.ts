import { useFilters } from "@fludge/client/providers/filters.provider";
import type { StatusFilter } from "@fludge/client/shared/use-filters";
import { ORDER_BY_FIELDS, STATUES } from "@fludge/client/shared/use-filters";
import { getI18nKey } from "@fludge/utils/validators/shared";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";

import type { IconName } from "@/core/shared/components/icon";

const statusOptions = [STATUES.ALL, STATUES.ACTIVE, STATUES.INACTIVE];
const orderByItems = [ORDER_BY_FIELDS.CREATED_AT, ORDER_BY_FIELDS.BALANCE];

export function useCustomersHeader() {
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
        label: getI18nKey("screens.customers.search.label"),
        placeholder: getI18nKey("screens.customers.search.placeholder"),
      },
    },
    state: {
      filters,
      statusOptions,
    },
  };
}

export function useCustomersOrderBySheet() {
  const { filters, setNextOrderBy } = useFilters();
  const [isPresented, setIsPresented] = useState(false);

  const open = () => setIsPresented(true);
  const close = () => setIsPresented(false);

  const orderByButtons = useMemo(() => {
    return orderByItems.map((i) => {
      const exists = filters.orderBy?.find((o) => o.field === i.value);

      let iconName: IconName = "remove";

      if (exists !== undefined) {
        switch (exists.direction) {
          case "asc":
            iconName = "keyboard-arrow-up";
            break;
          case "desc":
            iconName = "keyboard-arrow-down";
            break;
        }
      }

      return {
        ...i,
        icon: iconName,
      };
    });
  }, [filters.orderBy]);

  return {
    texts: {},
    state: {
      isPresented,
      orderByButtons,
    },
    actions: { open, close, setNextOrderBy, setIsPresented },
  };
}
