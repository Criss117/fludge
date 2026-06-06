import { count, eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useGroupCollection } from "./use-group-collection";
import { useGroupMembersCollection } from "./use-group-members-collection";
import { useMemberCollection } from "./use-member-collection";

export function useFindAllGroups(organizationId: string) {
  const { groupCollection } = useGroupCollection(organizationId);
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);
  const { memberCollection } = useMemberCollection(organizationId);

  return useLiveSuspenseQuery((q) =>
    q
      .from({
        g: groupCollection,
      })
      .select(({ g }) => ({
        id: g.id,
        name: g.name,
        permissions: g.permissions,
        createdBy: g.createdBy,
        createdAt: g.createdAt,
        members: q
          .from({
            gm: groupMembersCollection,
          })
          .innerJoin({ m: memberCollection }, ({ m, gm }) =>
            eq(m.id, gm.memberId),
          )
          .where(({ gm }) => eq(gm.groupId, g.id))
          .select(({ m, gm }) => ({
            id: m.id,
            name: m.user.name,
            email: m.user.email,
            assignedBy: gm.assignedBy,
          })),
      })),
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
