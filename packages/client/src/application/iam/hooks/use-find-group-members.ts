import { count, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useGroupMembersCollection } from "./use-group-members-collection";

export function useFindTotalGroupMembers(organizationId: string) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ gm: groupMembersCollection })
      .select(({ gm }) => ({
        total: count(gm.groupId),
      }))
      .findOne(),
  );

  const total = query.data?.total ?? 0;

  return { ...query, data: total };
}
