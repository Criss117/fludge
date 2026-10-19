import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useFilters } from "@fludge/client/providers/filters.provider";
import { useMemo, useState } from "react";

export function useProductsFiltersSheet() {
  const { filters, setOrderBy, setNextOrderBy } = useFilters();
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const orderBy = useMemo(() => {
    const createdAt = filters.orderBy?.find((o) => o.field === "createdAt");
    const stock = filters.orderBy?.find((o) => o.field === "stock");
    const minStock = filters.orderBy?.find((o) => o.field === "minStock");

    return [
      {
        key: "createdAt",
        direction: createdAt?.direction ?? "none",
        label: getI18nKey("helpers.order_by.created_at"),
      },
      {
        key: "stock",
        direction: stock?.direction ?? "none",
        label: getI18nKey("helpers.order_by.stock"),
      },
      {
        key: "minStock",
        direction: minStock?.direction ?? "none",
        label: getI18nKey("helpers.order_by.min_stock"),
      },
    ] as const;
  }, [filters.orderBy]);

  return {
    texts: {
      title: getI18nKey("helpers.filters.title"),
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
