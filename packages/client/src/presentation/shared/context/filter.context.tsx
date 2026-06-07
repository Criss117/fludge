import { createContext, use, useReducer } from "react";

export const GroupBy = {
  all: "all",
  active: "active",
  inactive: "inactive",
} as const;

export type GroupByType = (typeof GroupBy)[keyof typeof GroupBy];

type Filters = {
  query: string;
  group: GroupByType;
  tag: string;
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
  | { type: "reset:tag" };

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
      };
    case "reset:query":
      return {
        query: "",
        group: GroupBy.all,
        tag: "",
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
    default:
      return state;
  }
}

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, dispatch] = useReducer(filtersReducer, {
    query: "",
    group: GroupBy.all,
    tag: "",
  });

  return (
    <FiltersContext.Provider
      value={{
        filters,
        dispatch,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
