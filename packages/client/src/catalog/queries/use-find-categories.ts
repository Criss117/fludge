import { useContainer } from "@fludge/client/providers/container.provider";
import { SearchBlob } from "@fludge/utils/search-blob";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import type { FindAllGroupsFilters } from "@fludge/client/iam/domain/group.repository";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";

function normalizeFilters(filters?: FindAllGroupsFilters) {
  return {
    searchQuery: filters?.searchQuery
      ? SearchBlob.normalize(filters.searchQuery)
      : undefined,
  };
}

export const {
  keys: categoryKeys,
  useInvalidateQueries: useInvalidateCategories,
} = keysGenerator({
  module: "catalog",
  resource: "categories",
  normalizeFilters,
});

export function useFindCategories(filters?: FindAllGroupsFilters) {
  const { catalogContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters?.searchQuery ?? "");

  return useSuspenseInfiniteQuery({
    queryKey: categoryKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: ({ pageParam }) =>
      catalogContainer.repositories.categoryRepository.findAll(
        activeOrganization!.id,
        pageParam,
        {
          searchQuery: normalizedQuery,
        },
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
