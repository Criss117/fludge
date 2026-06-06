import { count, useLiveSuspenseQuery, eq, not } from "@tanstack/react-db";
import { useMemberCollection } from "./use-member-collection";

export function useFindTotalMembers(organizationId: string) {
  const { memberCollection } = useMemberCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ m: memberCollection })
      .select(({ m }) => ({
        total: count(m.id),
      }))
      .where(({ m }) => not(eq(m.role, "owner")))
      .findOne(),
  );

  const total = query.data?.total ?? 0;

  return { ...query, data: total };
}
