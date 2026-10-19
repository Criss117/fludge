import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFilters } from "@fludge/client/providers/filters.provider";
import type { OrderByDirection } from "@fludge/client/shared/use-filters";
import { useMemo, useState } from "react";

export function useProductsFiltersSheet() {
  const { filters, setOrderBy, setNextOrderBy } = useFilters();
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const orderBy = useMemo(() => {
    const orderBy = filters.orderBy?.find((o) => o.field === "createdAt");
    const stock = filters.orderBy?.find((o) => o.field === "stock");

    return {
      createdAt: orderBy?.direction ?? ("none" as OrderByDirection),
      stock: stock?.direction ?? ("none" as OrderByDirection),
    };
  }, [filters.orderBy]);

  return {
    texts: {
      title: getI18nKey("helpers.filters.title"),
      orderBy: {
        createdAt: getI18nKey("helpers.order_by.created_at"),
        stock: getI18nKey("helpers.order_by.stock"),
      },
    },
    actions: {
      close,
      open,
      setOrderBy,
      setNextOrderBy,
    },
    state: {
      isOpen,
      orderBy,
    },
  };
}
