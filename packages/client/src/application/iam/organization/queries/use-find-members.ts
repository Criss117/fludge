import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useFindAllMembers() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const activeOrganizationId = session.data?.activeOrganizationId!;

  const options = orpc.member.queries.findAll.queryOptions();

  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey.concat([activeOrganizationId]),
  });
}

export type AllMembers = Awaited<ReturnType<typeof useFindAllMembers>>["data"];
