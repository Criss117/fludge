import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useReducer } from "react";

export const STATUES = {
  ACTIVE: {
    label: getI18nKey("helpers.status.active"),
    value: "active",
  },
  INACTIVE: {
    label: getI18nKey("helpers.status.inactive"),
    value: "inactive",
  },
  DISCONTINUED: {
    label: getI18nKey("helpers.status.discontinued"),
    value: "discontinued",
  },
  ALL: {
    label: getI18nKey("helpers.status.all"),
    value: "all",
  },
} as const;

export const ORDER_BY_FIELDS = {
  CREATED_AT: {
    label: getI18nKey("helpers.order_by.created_at"),
    value: "createdAt",
  },
  STOCK: {
    label: getI18nKey("helpers.order_by.stock"),
    value: "stock",
  },
} as const;

export const ORDER_BY_DIRECTIONS = ["asc", "desc", "none"] as const;

export function nextOrderByDirection(direction: OrderByDirection) {
  return (
    ORDER_BY_DIRECTIONS[
      (ORDER_BY_DIRECTIONS.indexOf(direction) + 1) % ORDER_BY_DIRECTIONS.length
    ] ?? "none"
  );
}

export type StatusFilter = (typeof STATUES)[keyof typeof STATUES]["value"];
export type OrderByField = (typeof ORDER_BY_FIELDS)[keyof typeof ORDER_BY_FIELDS]["value"];
export type OrderByDirection = "asc" | "desc" | "none";
export type SearchQueryFilter = string;

type OrderByFilter = {
  field: OrderByField;
  direction: OrderByDirection;
};

export type Filters = {
  searchQuery: SearchQueryFilter;
  status: StatusFilter;
  orderBy?: OrderByFilter[];
};

export const initialFilters: Filters = {
  searchQuery: "",
  status: "all",
  orderBy: [],
};

export type FiltersAction =
  | { type: "SET_SEARCH_QUERY"; payload: SearchQueryFilter }
  | { type: "SET_STATUS"; payload: StatusFilter }
  | { type: "SET_ORDER_BY"; payload: OrderByFilter }
  | { type: "SET_NEXT_ORDER_BY"; payload: OrderByField }
  | { type: "REMOVE_ORDER"; payload: OrderByField }
  | { type: "CLEAR_ORDER" }
  | { type: "RESET" };

export function filtersReducer(state: Filters, action: FiltersAction): Filters {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_STATUS":
      return { ...state, status: action.payload };

    case "SET_ORDER_BY": {
      const current = state.orderBy ?? [];
      const exists = current.some((o) => o.field === action.payload.field);

      return {
        ...state,
        orderBy: exists
          ? current.map((o) => (o.field === action.payload.field ? action.payload : o))
          : [...current, action.payload],
      };
    }

    case "SET_NEXT_ORDER_BY": {
      const current = state.orderBy ?? [];
      const exists = current.some((o) => o.field === action.payload);

      return {
        ...state,
        orderBy: exists
          ? current.map((o) =>
              o.field === action.payload
                ? { ...o, direction: nextOrderByDirection(o.direction) }
                : o,
            )
          : [...current, { field: action.payload, direction: "asc" }],
      };
    }

    case "REMOVE_ORDER":
      return {
        ...state,
        orderBy: (state.orderBy ?? []).filter((o) => o.field !== action.payload),
      };

    case "CLEAR_ORDER":
      return { ...state, orderBy: [] };

    case "RESET":
      return initialFilters;

    default:
      return state;
  }
}

export function useFiltersReducer(initialState: Partial<Filters> = initialFilters) {
  const [filters, dispatch] = useReducer(filtersReducer, {
    ...initialFilters,
    ...initialState,
  });

  return {
    filters,
    dispatch,
    setSearchQuery: (q: SearchQueryFilter) => dispatch({ type: "SET_SEARCH_QUERY", payload: q }),
    setStatus: (s: StatusFilter) => dispatch({ type: "SET_STATUS", payload: s }),
    setOrderBy: (o: OrderByFilter) => dispatch({ type: "SET_ORDER_BY", payload: o }),
    removeOrder: (f: OrderByField) => dispatch({ type: "REMOVE_ORDER", payload: f }),
    clearOrder: () => dispatch({ type: "CLEAR_ORDER" }),
    reset: () => dispatch({ type: "RESET" }),
    setNextOrderBy: (f: OrderByField) => dispatch({ type: "SET_NEXT_ORDER_BY", payload: f }),
  };
}
