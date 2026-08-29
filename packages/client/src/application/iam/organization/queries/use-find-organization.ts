import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

type ORPC = ReturnType<typeof useOrpc>;

export function findAllOrganizationsOptions(orpc: ORPC, userId: string) {
  return {
    ...orpc.organization.queries.findAll.queryOptions(),
    queryKey: orpc.organization.queries.findAll.queryKey().concat([userId]),
  };
}

export function findActiveOrganizationOptions(
  orpc: ORPC,
  userId: string,
  organizationId: string,
) {
  return {
    ...orpc.organization.queries.findActive.queryOptions(),
    queryKey: orpc.organization.queries.findActive
      .queryKey()
      .concat([userId, organizationId]),
  };
}

export function useFindOrganizationsQueryOptions() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const userId = session.data?.user.id;
  const activeOrganizationId = session.data?.activeOrganizationId;

  if (!userId || !activeOrganizationId)
    throw new Error("User or active organization not found");

  const findAllOptions = findAllOrganizationsOptions(orpc, userId);

  const findActiveOptions = findActiveOrganizationOptions(
    orpc,
    userId,
    activeOrganizationId,
  );

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

export type OrganizationDetail = ReturnType<
  typeof useFindActiveOrganization
>["data"];

export type OrganizationSummary = ReturnType<
  typeof useFindAllOrganizations
>["data"][number];
