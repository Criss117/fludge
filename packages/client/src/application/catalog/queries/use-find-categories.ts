import { ilike, useLiveInfiniteQuery } from "@tanstack/react-db";
import { useCategoriesCollection } from "@fludge/client/application/catalog/collections/categories.collection";
import { SearchBlob } from "@fludge/utils/search-blob";

interface Filters {
  query: string;
}

export function useFindCategories(filters: Filters) {
  const { categoryCollection } = useCategoriesCollection();
  const normalizedQuery = SearchBlob.normalize(filters.query);

  return useLiveInfiniteQuery(
    (q) => {
      const query = q
        .from({ cc: categoryCollection })
        .select(({ cc }) => ({
          id: cc.id,
          name: cc.name,
          description: cc.description,
          createdAt: cc.createdAt,
          status: cc.status,
        }))
        .orderBy(({ cc }) => cc.createdAt, "desc");

      if (!normalizedQuery) return query;

      return query.where(({ cc }) =>
        ilike(cc.name, "%" + normalizedQuery + "%"),
      );
    },
    {
      initialPageParam: 0,
      pageSize: 10,
      queryKey: ["findCategories", normalizedQuery],
    },
  );
}

export type CategorySummary = ReturnType<
  typeof useFindCategories
>["data"][number];
