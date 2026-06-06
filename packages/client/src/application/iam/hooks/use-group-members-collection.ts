import { useMemo } from "react";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useQueryClient } from "@tanstack/react-query";
import { groupMemberCollectionBuilder } from "@fludge/client/application/iam/collections/group-member.collection";

export function useGroupMembersCollection(organizationId: string) {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const groupMembersCollection = useMemo(
    () => groupMemberCollectionBuilder(organizationId, queryClient, orpc),
    [organizationId],
  );

  return {
    groupMembersCollection,
  };
}
