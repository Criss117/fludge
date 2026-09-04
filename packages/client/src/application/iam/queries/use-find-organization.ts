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

export function useFindAllOrganizationsQueryOptions() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const userId = session.data?.user.id;

  if (!userId) throw new Error("User or active organization not found");

  return findAllOrganizationsOptions(orpc, userId);
}

export function useFindActiveOrganizationQueryOptions() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const userId = session.data?.user.id;
  const activeOrganizationId = session.data?.activeOrganizationId;

  if (!userId || !activeOrganizationId)
    throw new Error("User or active organization not found");

  return findActiveOrganizationOptions(orpc, userId, activeOrganizationId);
}

export function useFindAllOrganizations() {
  const findAllOptions = useFindAllOrganizationsQueryOptions();

  return useSuspenseQuery(findAllOptions);
}

export function useFindActiveOrganization() {
  const findActiveOptions = useFindActiveOrganizationQueryOptions();

  return useSuspenseQuery(findActiveOptions);
}

export type OrganizationDetail = ReturnType<
  typeof useFindActiveOrganization
>["data"];

export type OrganizationSummary = ReturnType<
  typeof useFindAllOrganizations
>["data"][number];
