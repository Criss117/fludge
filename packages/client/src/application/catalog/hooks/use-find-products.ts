import {
  count,
  ilike,
  or,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useProductCollection } from "@fludge/client/application/catalog/hooks/use-product-collection";

export type ProductSummary =
  ReturnType<typeof useFindAllProducts>["data"][number];

type Filters = {
  query?: string;
};

export function useFindAllProducts(
  organizationId: string,
  filters?: Filters,
) {
  const { productCollection } = useProductCollection(organizationId);

  const query = filters?.query ?? "";

  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({ p: productCollection })
        .select(({ p }) => ({ ...p }))
        .where(({ p }) =>
          or(
            ilike(p.name, `%${query}%`),
            ilike(p.sku, `%${query}%`),
            ilike(p.barcode, `%${query}%`),
          ),
        )
        .orderBy(({ p }) => p.createdAt, "desc"),
    [query],
  );
}

export function useTotalProducts(organizationId: string) {
  const { productCollection } = useProductCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ p: productCollection })
      .select(({ p }) => ({
        total: count(p.id),
      }))
      .findOne(),
  );

  const total = query.data?.total ?? 0;

  return { ...query, data: total };
}