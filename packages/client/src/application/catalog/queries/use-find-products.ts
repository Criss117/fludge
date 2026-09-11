import {
  eq,
  ilike,
  useLiveInfiniteQuery,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { SearchBlob } from "@fludge/utils/search-blob";

interface Filters {
  query: string;
  onlyActive?: boolean;
}

export function useFindProducts(filters?: Filters) {
  const { productCollection, activeOrganization } = useProductsCollection();

  const normalizedQuery = SearchBlob.normalize(filters?.query ?? "");
  const onlyActive = filters?.onlyActive ?? false;

  return useLiveInfiniteQuery(
    (q) => {
      const query = q
        .from({
          pc: productCollection,
        })
        .where(({ pc }) => ilike(pc.searchBlob, "%" + normalizedQuery + "%"))
        .orderBy(({ pc }) => pc.createdAt, "desc");

      if (onlyActive) {
        query.where(({ pc }) => eq(pc.status, "active"));
      }

      return query;
    },
    {
      initialPageParam: 0,
      pageSize: 10,
      queryKey: [
        "organization",
        activeOrganization.id,
        "products",
        normalizedQuery,
        onlyActive ? "all" : "only-active",
      ],
    },
  );
}

export function useFindOneProduct(productId: string) {
  const { productCollection, activeOrganization } = useProductsCollection();

  return useLiveSuspenseQuery({
    queryKey: ["organization", activeOrganization.id, "products", productId],
    query: (q) =>
      q
        .from({
          pc: productCollection,
        })
        .where(({ pc }) => eq(pc.id, productId))
        .findOne(),
  });
}

export type ProductSummary = ReturnType<typeof useFindProducts>["data"][number];
export type ProductDetail = NonNullable<
  ReturnType<typeof useFindOneProduct>["data"]
>;
