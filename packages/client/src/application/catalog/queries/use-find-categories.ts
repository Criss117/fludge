import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { SearchBlob } from "@fludge/utils/search-blob";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";

interface Filters {
  searchQuery?: string;
}

export const categoryKeys = {
  all: (orgId: string) =>
    ["catalog", "organizations", orgId, "categories"] as const,
  list: (orgId: string, filters?: Filters) =>
    [...categoryKeys.all(orgId), "list", filters] as const,
};

export function useFindCategories(filters?: Filters) {
  const { catalogContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters?.searchQuery ?? "");

  return useSuspenseInfiniteQuery({
    queryKey: categoryKeys.list(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: ({ pageParam }) =>
      catalogContainer.repositories.categoryRepository.findAll(
        activeOrganization.id,
        pageParam,
        {
          searchQuery: normalizedQuery,
        },
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useInvalidateCategories() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();

  if (!activeOrganization) throw new Error("Active organization not found");

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: categoryKeys.all(activeOrganization.id),
    });
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: categoryKeys.list(activeOrganization.id),
    });
  };

  return { invalidateAll, invalidateList };
}
