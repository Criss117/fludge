import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { SearchBlob } from "@fludge/utils/search-blob";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { FindAllProductsFilters } from "../domain/product.repository";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";

function normalizeFilters(filters?: FindAllProductsFilters) {
  return {
    searchQuery: filters?.searchQuery
      ? SearchBlob.normalize(filters.searchQuery)
      : undefined,
  };
}

export const {
  keys: productKeys,
  useInvalidateQueries: useInvalidateProducts,
} = keysGenerator({
  module: "catalog",
  resource: "products",
  normalizeFilters,
});

export function useFindProducts(filters?: FindAllProductsFilters) {
  const { catalogContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters?.searchQuery ?? "");

  return useSuspenseInfiniteQuery({
    queryKey: productKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: ({ pageParam }) =>
      catalogContainer.repositories.productRepository.findAll(
        activeOrganization.id,
        pageParam,
        {
          searchQuery: normalizedQuery,
        },
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFindProduct(productId: string) {
  const { catalogContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: productKeys.detail(activeOrganization.id, productId),
    queryFn: () =>
      catalogContainer.repositories.productRepository.findOneById(
        activeOrganization.id,
        productId,
      ),
  });
}
