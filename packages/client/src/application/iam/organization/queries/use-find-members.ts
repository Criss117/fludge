import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";

type ORPC = ReturnType<typeof useOrpc>;

export function findAllMembersOptions(orpc: ORPC, organizationId: string) {
  return {
    ...orpc.member.queries.findAll.queryOptions(),
    queryKey: orpc.member.queries.findAll.queryKey().concat([organizationId]),
  };
}

export function useFindMembersQueryOptions() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const activeOrganizationId = session.data?.activeOrganizationId;

  if (!activeOrganizationId) throw new Error("Active organization not found");

  const findAllOptions = findAllMembersOptions(orpc, activeOrganizationId);

  return { findAllOptions };
}

export function useFindAllMembers() {
  const { findAllOptions } = useFindMembersQueryOptions();

  return useSuspenseQuery(findAllOptions);
}

export function useFindMember(memberId: string) {
  const { data: allMembers } = useFindAllMembers();

  return allMembers.find((d) => d.id === memberId)!;
}

export type Member = ReturnType<typeof useFindMember>;
export type AllMembers = ReturnType<typeof useFindAllMembers>["data"];
