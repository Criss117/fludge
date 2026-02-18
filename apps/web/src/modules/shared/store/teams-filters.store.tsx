import { createContext, use, useReducer } from "react";

export type Filters = {
  query: string;
};

export type Actions = {
  action: "set:query";
  payload: string;
};

interface Context {
  filters: Filters;
  filtersDispatch: React.ActionDispatch<[action: Actions]>;
}

interface FiltersProviderProps {
  children: React.ReactNode;
}

function reducer(state: Filters, action: Actions): Filters {
  switch (action.action) {
    case "set:query":
      return { ...state, query: action.payload };
    default:
      return state;
  }
}

const TeamsFiltersContext = createContext<Context | null>(null);

export function FiltersProvider({ children }: FiltersProviderProps) {
  const [filters, filtersDispatch] = useReducer(reducer, {
    query: "",
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
