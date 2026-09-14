import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { DEFAULT_CURSOR } from "@fludge/utils/pagination";
import { SearchBlob } from "@fludge/utils/search-blob";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

interface Filters {
  searchQuery?: string;
}

export const productKeys = {
  all: (orgId: string) =>
    ["catalog", "organizations", orgId, "products"] as const,
  list: (orgId: string, filters?: Filters) =>
    [...productKeys.all(orgId), "list", filters] as const,
  detail: (orgId: string, productId?: string) =>
    [...productKeys.all(orgId), "detail", productId] as const,
};

export function useFindProducts(filters?: Filters) {
  const { catalogContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  const normalizedQuery = SearchBlob.normalize(filters?.searchQuery ?? "");

  return useSuspenseInfiniteQuery({
    queryKey: productKeys.list(activeOrganization.id, filters),
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

export function useInvalidateProducts() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();

  if (!activeOrganization) throw new Error("Active organization not found");

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: productKeys.all(activeOrganization.id),
    });
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: productKeys.list(activeOrganization.id),
    });
  };

  return { invalidateAll, invalidateList };
}
