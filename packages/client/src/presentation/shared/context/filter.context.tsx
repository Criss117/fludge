import { createContext, use, useMemo, useReducer } from "react";

export const GroupBy = {
  all: "all",
  active: "active",
  inactive: "inactive",
} as const;

export type GroupByType = (typeof GroupBy)[keyof typeof GroupBy];

export type SortDirection = "asc" | "desc" | null;

type Filters = {
  query: string;
  group: GroupByType;
  tag: string;
  sort: { key: string; direction: SortDirection };
};

type Actions =
  | {
      type: "set:query";
      payload: string;
    }
  | { type: "set:group"; payload: string }
  | { type: "reset:group" }
  | { type: "reset:query" }
  | { type: "reset" }
  | { type: "set:tag"; payload: string }
  | { type: "reset:tag" }
  | { type: "set:sort"; payload: { key: string; direction: SortDirection } }
  | { type: "reset:sort" };

interface Context {
  filters: Filters;
  dispatch: React.Dispatch<Actions>;
}

const FiltersContext = createContext<Context | null>(null);

export function useFilters() {
  const context = use(FiltersContext);

  if (!context) throw new Error("Filters context not found");

  return context;
}

export function filtersReducer(state: Filters, action: Actions) {
  switch (action.type) {
    case "set:query":
      return {
        ...state,
        query: action.payload,
      };
    case "reset":
      return {
        query: "",
        group: GroupBy.all,
        tag: "",
        sort: { key: "", direction: null },
      };
    case "reset:query":
      return {
        query: "",
        group: GroupBy.all,
        tag: "",
        sort: { key: "", direction: null },
      };
    case "set:group":
      if (!Object.values(GroupBy).includes(action.payload as GroupByType))
        return state;

      const group = action.payload as GroupByType;

      return {
        ...state,
        group,
      };
    case "reset:group":
      return {
        ...state,
        group: GroupBy.all,
      };
    case "set:tag":
      return {
        ...state,
        tag: action.payload,
      };
    case "reset:tag":
      return {
        ...state,
        tag: "",
      };
    case "set:sort":
      return {
        ...state,
        sort: action.payload,
      };
    case "reset:sort":
      return {
        ...state,
        sort: { key: "", direction: null },
      };
    default:
      return state;
  }
}

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, dispatch] = useReducer(filtersReducer, {
    query: "",
    group: GroupBy.all,
    tag: "",
    sort: { key: "", direction: null },
  });

  const value = useMemo(() => ({ filters, dispatch }), [filters]);

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}
