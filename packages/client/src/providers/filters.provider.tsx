import { createContext, use } from "react";

import { type Filters, useFiltersReducer } from "../shared/use-filters";

type Context = ReturnType<typeof useFiltersReducer>;

const FilterConext = createContext<Context | null>(null);

export function FiltersProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: Partial<Filters>;
}) {
  const filter = useFiltersReducer(initialState);

  return <FilterConext.Provider value={filter}>{children}</FilterConext.Provider>;
}

export function useFilters() {
  const context = use(FilterConext);

  if (!context) throw new Error("useFiltersContext must be used within a FiltersProvider");

  return context;
}
