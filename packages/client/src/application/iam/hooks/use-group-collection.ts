import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useORPC } from "@fludge/client/providers/orpc.provider";
import { groupCollectionBuilder } from "@fludge/client/application/iam/collections/group.collection";

export function useGroupCollection(organizationId: string) {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const groupCollection = useMemo(
    () => groupCollectionBuilder(organizationId, queryClient, orpc),
    [organizationId],
  );

  return {
    groupCollection,
  };
}
