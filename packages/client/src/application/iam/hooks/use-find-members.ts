import { useMemo } from "react";
import {
  count,
  useLiveSuspenseQuery,
  eq,
  ilike,
  toArray,
} from "@tanstack/react-db";
import { useMemberCollection } from "./use-member-collection";
import { useGroupMembersCollection } from "./use-group-members-collection";
import { useGroupCollection } from "./use-group-collection";

type Filters = {
  name?: string;
  groupId?: string;
};

export function useFindOneMember(organizationId: string, memberId: string) {
  const { memberCollection } = useMemberCollection(organizationId);
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);
  const { groupCollection } = useGroupCollection(organizationId);

  return useLiveSuspenseQuery(
    (q) => {
      const groupsQuery = q
        .from({ gm: groupMembersCollection })
        .innerJoin({ g: groupCollection }, ({ g, gm }) =>
          eq(g.id, gm.groupId),
        )
        .select(({ g }) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          permissions: g.permissions,
          description: g.description,
        }));

      return q
        .from({ m: memberCollection })
        .select(({ m }) => ({
          ...m,
          groups: toArray(
            groupsQuery.where(({ gm }) => eq(gm.memberId, m.id)),
          ),
        }))
        .where(({ m }) => eq(m.id, memberId))
        .findOne();
    },
    [memberId],
  );
}

export type MemberWithGroups = NonNullable<
  ReturnType<typeof useFindOneMember>["data"]
>;

export type MemberGroup = MemberWithGroups["groups"][number];

export function useTotalMembers(organizationId: string) {
  const { memberCollection } = useMemberCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ m: memberCollection })
      .select(({ m }) => ({
        total: count(m.id),
      }))
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
  const groupId = filters?.groupId;

  const { data } = useLiveSuspenseQuery(
    (q) => {
      const groupsQuery = q
        .from({ gm: groupMembersCollection })
        .innerJoin({ g: groupCollection }, ({ g, gm }) => eq(g.id, gm.groupId))
        .select(({ g }) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          permissions: g.permissions,
        }));

      const membersQuery = q
        .from({ m: memberCollection })
        .select(({ m }) => ({
          ...m,
          groups: toArray(groupsQuery.where(({ gm }) => eq(gm.memberId, m.id))),
        }))
        .where(({ m }) => ilike(m.user.name, `%${name ?? ""}%`));

      return membersQuery;
    },
    [name],
  );

  const members = useMemo(() => {
    if (!groupId) return data;

    return data.filter((m) => m.groups.some((g) => g.id === groupId));
  }, [data, groupId]);

  return members;
}

export type MemberSummary = ReturnType<typeof useFindAllMembers>[number];
