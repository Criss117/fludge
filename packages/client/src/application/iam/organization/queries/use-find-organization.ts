import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindOrganizationsQueryOptions() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const findAllOptions = {
    ...orpc.organization.queries.findAll.queryOptions(),
    queryKey: orpc.organization.queries.findAll
      .queryKey()
      .concat([session.data?.user.id]),
  };

  const findActiveOptions = {
    ...orpc.organization.queries.findActive.queryOptions(),
    queryKey: orpc.organization.queries.findActive
      .queryKey()
      .concat([session.data?.user.id, session.data?.activeOrganizationId]),
  };

  return { findAllOptions, findActiveOptions };
}

export function useFindAllOrganizations() {
  const { findAllOptions } = useFindOrganizationsQueryOptions();

  return useSuspenseQuery(findAllOptions);
}

export function useFindActiveOrganization() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();

  return useSuspenseQuery(findActiveOptions);
}

export type ActiveOrganization = ReturnType<
  typeof useFindActiveOrganization
>["data"];

export type AllOrganizations = ReturnType<
  typeof useFindAllOrganizations
>["data"];
