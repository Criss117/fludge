import {
  count,
  eq,
  ilike,
  materialize,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useCategoryCollection } from "@fludge/client/application/catalog/hooks/use-categories-collection";
import { useMemberCollection } from "@fludge/client/application/iam/hooks/use-member-collection";

export type CategorySummary = ReturnType<
  typeof useFindAllCategories
>["data"][number];

type Filters = {
  name?: string;
};

export function useFindAllCategories(
  organizationId: string,
  filters?: Filters,
) {
  const { categoryCollection } = useCategoryCollection(organizationId);
  const { memberCollection } = useMemberCollection(organizationId);

  const name = filters?.name ?? "";

  return useLiveSuspenseQuery(
    (q) => {
      const memberQuery = q
        .from({ m: memberCollection })
        .select(({ m }) => ({
          memberId: m.id,
          user: m.user,
        }))
        .findOne();

      return q
        .from({ c: categoryCollection })
        .select(({ c }) => ({
          ...c,
          createdBy: materialize(
            memberQuery.where(({ m }) => eq(m.id, c.createdBy)),
          ),
        }))
        .where(({ c }) => ilike(c.name, `%${name}%`))
        .orderBy(({ c }) => c.createdAt, "desc");
    },
    [name],
  );
}

export function useTotalCategories(organizationId: string) {
  const { categoryCollection } = useCategoryCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ c: categoryCollection })
      .select(({ c }) => ({
        total: count(c.id),
      }))
      .findOne(),
  );

  const total = query.data?.total ?? 0;

  return { ...query, data: total };
}
