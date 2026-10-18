import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useContainer } from "@fludge/client/providers/container.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { SearchBlob } from "@fludge/utils/search-blob";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import type { FindAllProductsFilters } from "../domain/product.repository";

function normalizeFilters(filters: FindAllProductsFilters) {
  return {
    searchQuery: SearchBlob.normalize(filters.searchQuery),

    status: filters.status,
    orderBy: {
      createdAt: filters.orderBy.createdAt,
      stock: filters.orderBy.stock,
    },
  };
}

export const { keys: productKeys, useInvalidateQueries: useInvalidateProducts } = keysGenerator({
  module: "catalog",
  resource: "products",
  normalizeFilters,
});

export function useFindProducts(filters: FindAllProductsFilters) {
  const { catalogContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters.searchQuery);

  return useSuspenseInfiniteQuery({
    queryKey: productKeys.filteredList(activeOrganization.id, filters),
    initialPageParam: DEFAULT_CURSOR,
    queryFn: async ({ pageParam }) =>
      unwrapResult(
        await catalogContainer.repositories.productRepository.findAll(
          activeOrganization.id,
          pageParam,
          {
            searchQuery: normalizedQuery,
            status: filters.status,
            orderBy: {
              createdAt: filters.orderBy.createdAt,
              stock: filters.orderBy.stock,
            },
          },
        ),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFindProduct(productId: string) {
  const { catalogContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: productKeys.detail(activeOrganization.id, productId),
    queryFn: async () =>
      unwrapResult(
        await catalogContainer.repositories.productRepository.findOneById(
          activeOrganization.id,
          productId,
        ),
      ),
  });
}
