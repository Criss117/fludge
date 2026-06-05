import { useSuspenseQuery } from "@tanstack/react-query";
import { useORPC } from "@fludge/client/providers/orpc.provider";

export function useSession() {
  const { orpc } = useORPC();

  return useSuspenseQuery(orpc.auth.queries.getSession.queryOptions());
}
