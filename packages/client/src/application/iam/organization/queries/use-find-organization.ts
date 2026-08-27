import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindAllOrganizations() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const userId = session.data?.user.id;
  const options = orpc.organization.queries.findAll.queryOptions();

  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey.concat([userId]),
  });
}

export function useFindActiveOrganization() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const userId = session.data?.user.id!;
  const activeOrganizationId = session.data?.activeOrganizationId!;
  const options = orpc.organization.queries.findActive.queryOptions();

  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey.concat([userId, activeOrganizationId]),
  });
}

export type ActiveOrganization = ReturnType<
  typeof useFindActiveOrganization
>["data"];

export type AllOrganizations = ReturnType<
  typeof useFindAllOrganizations
>["data"];
