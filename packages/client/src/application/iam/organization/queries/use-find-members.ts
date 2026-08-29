import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFindActiveOrganization } from "./use-find-organization";

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

type Filters = {
  query: string;
  byGroupId?: string;
};

export function useFindAllMembers(filters?: Filters) {
  const { findAllOptions } = useFindMembersQueryOptions();

  const { data, ...rest } = useSuspenseQuery(findAllOptions);
  const { data: activeOrganization } = useFindActiveOrganization();

  const members = useMemo(() => {
    if (!filters?.query && !filters?.byGroupId) return data;

    const query = filters?.query;

    const filterByQuery = query
      ? data.filter(
          (d) =>
            d.user.name.toLowerCase().includes(query.toLowerCase()) ||
            d.user.email.toLowerCase().includes(query.toLowerCase()),
        )
      : data;

    if (!filters?.byGroupId) return filterByQuery;

    const gms = activeOrganization.groupMembers.filter(
      (gm) => gm.groupId === filters.byGroupId,
    );

    return filterByQuery.filter((d) => gms.some((gm) => gm.memberId === d.id));
  }, [data, filters?.query, filters?.byGroupId]);

  return { data: members, ...rest };
}

export function useFindMember(memberId: string) {
  const { data: allMembers, ...rest } = useFindAllMembers();

  const member = allMembers.find((d) => d.id === memberId);

  if (!member) throw new Error("Miembro no encontrado");

  return { data: member, ...rest };
}

export type MemberSummary = ReturnType<
  typeof useFindAllMembers
>["data"][number];
