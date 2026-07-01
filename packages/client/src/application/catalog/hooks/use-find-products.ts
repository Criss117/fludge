import {
  count,
  eq,
  ilike,
  materialize,
  or,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useProductCollection } from "@fludge/client/application/catalog/hooks/use-product-collection";
import { useMemberCollection } from "@fludge/client/application/iam/hooks/use-member-collection";
import { useCategoryCollection } from "@fludge/client/application/catalog/hooks/use-categories-collection";

export type ProductSummary = ReturnType<
  typeof useFindAllProducts
>["data"][number];

type Filters = {
  query?: string;
};

export function useFindAllProducts(organizationId: string, filters?: Filters) {
  const { productCollection } = useProductCollection(organizationId);
  const { memberCollection } = useMemberCollection(organizationId);
  const { categoryCollection } = useCategoryCollection(organizationId);

  const query = filters?.query ?? "";

  return useLiveSuspenseQuery(
    (q) => {
      const memberQuery = q
        .from({ m: memberCollection })
        .select(({ m }) => ({
          memberId: m.id,
          user: m.user,
        }))
        .findOne();

      const categoryQuery = q
        .from({ c: categoryCollection })
        .select(({ c }) => ({
          categoryId: c.id,
          name: c.name,
        }))
        .findOne();

      return q
        .from({ p: productCollection })
        .select(({ p }) => ({
          ...p,
          createdBy: materialize(
            memberQuery.where(({ m }) => eq(m.id, p.createdBy)),
          ),
          category: materialize(
            categoryQuery.where(({ c }) => eq(c.id, p.categoryId)),
          ),
        }))
        .where(({ p }) =>
          or(
            ilike(p.name, `%${query}%`),
            ilike(p.sku, `%${query}%`),
            ilike(p.barcode, `%${query}%`),
          ),
        )
        .orderBy(({ p }) => p.createdAt, "desc");
    },
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
