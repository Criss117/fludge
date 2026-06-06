import { useMemo } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useQueryClient } from "@tanstack/react-query";
import { memberCollectionBuilder } from "@fludge/client/application/iam/collections/member.collection";

export function useMemberCollection(organizationId: string) {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const memberCollection = useMemo(
    () => memberCollectionBuilder(organizationId, queryClient, orpc),
    [organizationId],
  );

  return {
    memberCollection,
  };
}
