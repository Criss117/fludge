import {
  and,
  count,
  eq,
  ilike,
  toArray,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useGroupCollection } from "./use-group-collection";
import { useGroupMembersCollection } from "./use-group-members-collection";
import { useMemberCollection } from "./use-member-collection";

export type GroupSummary = ReturnType<typeof useFindAllGroups>["data"][number];
export type GroupDetail = NonNullable<
  ReturnType<typeof useFindOneGroup>["data"]
>;

type Filters = {
  name?: string;
};

export function useFindAllGroups(organizationId: string, filters?: Filters) {
  const { groupCollection } = useGroupCollection(organizationId);
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const name = filters?.name ?? "";

  return useLiveSuspenseQuery(
    (q) => {
      const membersQuery = q
        .from({
          gm: groupMembersCollection,
        })
        .select(({ gm }) => ({
          total: count(gm.memberId),
        }))
        .findOne();

      return q
        .from({
          g: groupCollection,
        })
        .select(({ g }) => ({
          ...g,
          members: toArray(
            membersQuery.where(({ gm }) => eq(gm.groupId, g.id)),
          ),
        }))
        .where(({ g }) => ilike(g.name, `%${name}%`))
        .orderBy(({ g }) => g.createdAt, "desc");
    },
    [name],
  );
}

export function useFindOneGroup(organizationId: string, groupSlug: string) {
  const { groupCollection } = useGroupCollection(organizationId);
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);
  const { memberCollection } = useMemberCollection(organizationId);

  return useLiveSuspenseQuery(
    (q) => {
      const membersQuery = q
        .from({
          gm: groupMembersCollection,
        })
        .innerJoin({ m: memberCollection }, ({ m, gm }) =>
          eq(m.id, gm.memberId),
        )
        .select(({ m, gm }) => ({
          id: m.id,
          user: m.user,
          assignedBy: gm.assignedBy,
        }));

      return q
        .from({ g: groupCollection })
        .select(({ g }) => ({
          ...g,
          members: toArray(
            membersQuery.where(({ gm }) => eq(gm.groupId, g.id)),
          ),
        }))
        .where(({ g }) =>
          and(eq(g.slug, groupSlug), eq(g.organizationId, organizationId)),
        )
        .findOne();
    },
    [groupSlug],
  );
}

export function useTotalGroups(organizationId: string) {
  const { groupCollection } = useGroupCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ g: groupCollection })
      .select(({ g }) => ({
        total: count(g.id),
      }))
      .findOne(),
  );

  const total = query.data?.total ?? 0;

  return { ...query, data: total };
}
