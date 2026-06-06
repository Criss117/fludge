import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useQueryClient } from "@tanstack/react-query";
import { groupCollectionBuilder } from "@fludge/client/application/iam/collections/group.collection";

export function useGroupCollection() {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const collection = groupCollectionBuilder(queryClient, orpc);

  return {
    collection,
  };
}
