import {
  count,
  useLiveSuspenseQuery,
  eq,
  not,
  ilike,
} from "@tanstack/react-db";
import { useMemberCollection } from "./use-member-collection";
import { useGroupMembersCollection } from "./use-group-members-collection";
import { useGroupCollection } from "./use-group-collection";

type Filters = {
  name?: string;
};

export function useTotalMembers(organizationId: string) {
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

export function useFindAllMembers(organizationId: string, filters?: Filters) {
  const { groupCollection } = useGroupCollection(organizationId);
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);
  const { memberCollection } = useMemberCollection(organizationId);

  const name = filters?.name;

  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({ m: memberCollection })
        .select(({ m }) => ({
          id: m.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          createdAt: m.createdAt,
          groups: q
            .from({ gm: groupMembersCollection })
            .innerJoin({ g: groupCollection }, ({ g, gm }) =>
              eq(g.id, gm.groupId),
            )
            .where(({ gm }) => eq(gm.memberId, m.id))
            .select(({ g }) => ({
              id: g.id,
              name: g.name,
              permissions: g.permissions,
            })),
        }))
        .where(({ m }) => ilike(m.user.name, `%${name ?? ""}%`)),
    [name],
  );
}

export type MemberSummary = ReturnType<
  typeof useFindAllMembers
>["data"][number];
