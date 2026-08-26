import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindAllOrganizations() {
  const orpc = useOrpc();
  return useSuspenseQuery(orpc.organization.queries.findAll.queryOptions());
}

export function useFindActiveOrganization() {
  const orpc = useOrpc();
  return useSuspenseQuery(orpc.organization.queries.findActive.queryOptions());
}

export type ActiveOrganization = ReturnType<
  typeof useFindActiveOrganization
>["data"];

export type AllOrganizations = ReturnType<
  typeof useFindAllOrganizations
>["data"];
