import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useGroupMembersCollection } from "./use-group-members-collection";

export function useFindTotalGroupMembers(organizationId: string) {
  const { groupMembersCollection } = useGroupMembersCollection(organizationId);

  const query = useLiveSuspenseQuery((q) =>
    q.from({ gm: groupMembersCollection }).select(({ gm }) => ({
      memberId: gm.memberId,
    })),
  );

  const total = new Set(query.data.map((d) => d.memberId)).size;

  return { ...query, data: total };
}
