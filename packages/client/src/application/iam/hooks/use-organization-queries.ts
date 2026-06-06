import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindAllOrganization() {
  const { orpc } = useORPC();
  return useSuspenseQuery(orpc.organizations.queries.findAll.queryOptions());
}

export function useFindActiveOrganization() {
  const { orpc } = useORPC();
  return useSuspenseQuery(orpc.organizations.queries.findActive.queryOptions());
}
