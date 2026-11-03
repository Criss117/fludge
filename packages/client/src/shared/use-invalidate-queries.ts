import { useQueryClient } from "@tanstack/react-query";

import { useAppState } from "../iam/hooks/use-app-state";

type Module = "catalog" | "iam" | "commerce";
type Resource =
  "products" | "groups" | "members" | "categories" | "customers" | "sales" | "customer-payments";

interface QueryKeysGeneratorProps<T, TNormalizedFilters> {
  module: Module;
  resource: Resource;
  normalizeFilters: (filters: T) => TNormalizedFilters;
}

type QueryKeysReturn<T, TNormalizedFilters> = {
  all: (orgId: string) => readonly ["organizations", string, Module, Resource];

  list: (orgId: string) => readonly ["organizations", string, Module, Resource, "list"];

  filteredList: (
    orgId: string,
    filters: T,
  ) => readonly ["organizations", string, Module, Resource, "list", TNormalizedFilters];

  allDetails: (orgId: string) => readonly ["organizations", string, Module, Resource, "detail"];

  detail: (
    orgId: string,
    resourceId: string,
  ) => readonly ["organizations", string, Module, Resource, "detail", string];
};

function queriesKeysGenerator<T, TNormalizedFilters>({
  module,
  resource,
  normalizeFilters,
}: QueryKeysGeneratorProps<T, TNormalizedFilters>): QueryKeysReturn<T, TNormalizedFilters> {
  const all = (orgId: string) => ["organizations", orgId, module, resource] as const;

  const list = (orgId: string) => [...all(orgId), "list"] as const;

  const filteredList = (orgId: string, filters: T) =>
    [...list(orgId), normalizeFilters?.(filters)] as const;

  const allDetails = (orgId: string) => [...all(orgId), "detail"] as const;

  const detail = (orgId: string, resourceId: string) => [...allDetails(orgId), resourceId] as const;

  return {
    all,
    list,
    filteredList,
    allDetails,
    detail,
  };
}

function genearteInvalidateQueries<T, TNormalizedFilters>(
  keys: QueryKeysReturn<T, TNormalizedFilters>,
) {
  return function useInvalidateQueries() {
    const queryClient = useQueryClient();
    const {
      data: { activeOrganization },
    } = useAppState();

    if (!activeOrganization) throw new Error("Active organization not found");

    const orgId = activeOrganization.id;

    const invalidateAll = () => {
      return queryClient.invalidateQueries({
        queryKey: keys.all(orgId),
      });
    };

    const invalidateList = () => {
      return queryClient.invalidateQueries({
        queryKey: keys.list(orgId),
      });
    };

    const invalidateFilteredList = (filters: T) => {
      return queryClient.invalidateQueries({
        queryKey: keys.filteredList(orgId, filters),
      });
    };

    const invalidateAllDetails = () => {
      return queryClient.invalidateQueries({
        queryKey: keys.allDetails(orgId),
      });
    };

    const invalidateDetail = (resourceId: string) => {
      return queryClient.invalidateQueries({
        queryKey: keys.detail(orgId, resourceId),
      });
    };

    return {
      invalidateAll,
      invalidateList,
      invalidateFilteredList,
      invalidateAllDetails,
      invalidateDetail,
    };
  };
}

export function keysGenerator<T, TNormalizedFilters>(
  props: QueryKeysGeneratorProps<T, TNormalizedFilters>,
) {
  const keys = queriesKeysGenerator(props);

  return {
    keys,
    useInvalidateQueries: genearteInvalidateQueries(keys),
  };
}
