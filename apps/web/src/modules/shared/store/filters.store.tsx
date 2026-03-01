import { createContext, use, useReducer } from "react";

export const Limits = [10, 20, 30, 40, 50] as const;

export type Filters = {
  query: string;
  limit: (typeof Limits)[number];
  page: number;
  orderBy: Map<string, "desc" | "asc" | null>;
};

export type Actions =
  | {
      action: "set:query";
      payload: string;
    }
  | {
      action: "set:limit";
      payload: (typeof Limits)[number];
    }
  | {
      action: "set:page";
      payload: number;
    }
  | {
      action: "toogle:order-by";
      payload: string;
    };

interface Context {
  filters: Filters;
  filtersDispatch: React.ActionDispatch<[action: Actions]>;
}

interface FiltersProviderProps {
  children: React.ReactNode;
}

function getNextOrderBy(orderBy: "desc" | "asc" | null) {
  switch (orderBy) {
    case null:
      return "desc";
    case "desc":
      return "asc";
    case "asc":
      return null;
  }
}

function reducer(state: Filters, action: Actions): Filters {
  switch (action.action) {
    case "set:query":
      return { ...state, query: action.payload };
    case "set:limit":
      return { ...state, limit: action.payload, page: 0 };
    case "set:page":
      return { ...state, page: action.payload };
    case "toogle:order-by":
      const orderBy = state.orderBy.get(action.payload);

      if (orderBy === undefined)
        return {
          ...state,
          orderBy: new Map(state.orderBy).set(action.payload, "desc"),
        };

      return {
        ...state,
        orderBy: new Map(state.orderBy).set(
          action.payload,
          getNextOrderBy(orderBy),
        ),
      };

    default:
      return state;
  }
}

const TeamsFiltersContext = createContext<Context | null>(null);

export function FiltersProvider({ children }: FiltersProviderProps) {
  const [filters, filtersDispatch] = useReducer(reducer, {
    query: "",
    limit: 10,
    page: 0,
    orderBy: new Map(),
  });

  return (
    <TeamsFiltersContext.Provider
      value={{
        filters,
        filtersDispatch,
      }}
    >
      {children}
    </TeamsFiltersContext.Provider>
  );
}

export function useFilters() {
  const context = use(TeamsFiltersContext);

  if (!context)
    throw new Error("useFilters must be used within a FiltersProvider");

  return context;
}
