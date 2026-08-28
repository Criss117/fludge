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

export function useFindMember(memberId: string) {
  const { data: allMembers } = useFindAllMembers();

  return allMembers.find((d) => d.id === memberId)!;
}

export type Member = ReturnType<typeof useFindMember>;
export type AllMembers = ReturnType<typeof useFindAllMembers>["data"];
