import { useSuspenseQuery } from "@tanstack/react-query";

import { useORPC } from "@fludge/client/providers/orpc.provider";

export function useFindGroupHistory(groupId: string) {
  const { orpc } = useORPC();

  return useSuspenseQuery(
    orpc.groups.queries.findHistory.queryOptions({ input: { groupId } }),
  );
}