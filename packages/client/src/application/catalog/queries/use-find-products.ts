import { ilike, useLiveInfiniteQuery } from "@tanstack/react-db";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { SearchBlob } from "@fludge/utils/search-blob";

interface Filters {
  query: string;
}

export function useFindProducts(filters: Filters) {
  const { productCollection } = useProductsCollection();

  const normalizedQuery = SearchBlob.normalize(filters.query);

  return useLiveInfiniteQuery(
    (q) => {
      return q
        .from({
          pc: productCollection,
        })
        .select(({ pc }) => ({
          id: pc.id,
          name: pc.name,
          searchBlob: pc.searchBlob,
          description: pc.description,
          createdAt: pc.createdAt,
          status: pc.status,
          stock: pc.stock,
          allowNegativeStock: pc.allowNegativeStock,
          totalPresentations: pc.totalPresentations,
        }))
        .where(({ pc }) => ilike(pc.searchBlob, "%" + normalizedQuery + "%"))
        .orderBy(({ pc }) => pc.createdAt, "desc");
    },
    {
      initialPageParam: 0,
      pageSize: 10,
      queryKey: ["findProducts", normalizedQuery],
    },
  );
}

export type ProductSummary = ReturnType<typeof useFindProducts>["data"][number];
