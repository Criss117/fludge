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

interface TeamsFiltersProviderProps {
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

export function TeamsFiltersProvider({ children }: TeamsFiltersProviderProps) {
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

export function useTeamsFilters() {
  const context = use(TeamsFiltersContext);

  if (!context)
    throw new Error(
      "useTeamsFilters must be used within a TeamsFiltersProvider",
    );

  return context;
}
