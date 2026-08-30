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

type MemberFilter = {
  id: string;
  role: string;
  user: {
    name: string;
    email: string;
  };
};

export type MemberFilters = {
  query?: string;
  byGroupId?: string;
  excludeByGroupId?: string;
  excludeOwners?: boolean;
};

type GroupMemberReference = {
  groupId: string;
  memberId: string;
};

export function filterMembers<T extends MemberFilter>(
  data: T[],
  groupMembers: GroupMemberReference[],
  filters: MemberFilters = {},
) {
  if (filters.byGroupId && filters.excludeByGroupId) {
    throw new Error("byGroupId and excludeByGroupId cannot be used together");
  }

  const query = filters.query?.toLowerCase();
  const memberIds = new Set(
    groupMembers
      .filter((groupMember) =>
        filters.byGroupId || filters.excludeByGroupId
          ? groupMember.groupId ===
            (filters.byGroupId ?? filters.excludeByGroupId)
          : false,
      )
      .map((groupMember) => groupMember.memberId),
  );

  return data.filter((member) => {
    const matchesQuery =
      !query ||
      member.user.name.toLowerCase().includes(query) ||
      member.user.email.toLowerCase().includes(query);
    const matchesGroup = filters.byGroupId
      ? memberIds.has(member.id)
      : !filters.excludeByGroupId || !memberIds.has(member.id);
    const isAllowedRole = !filters.excludeOwners || member.role !== "owner";

    return matchesQuery && matchesGroup && isAllowedRole;
  });
}

export function useFindAllMembers(filters?: MemberFilters) {
  const { findAllOptions } = useFindMembersQueryOptions();

  const { data, ...rest } = useSuspenseQuery(findAllOptions);
  const { data: activeOrganization } = useFindActiveOrganization();

  const members = useMemo(
    () => filterMembers(data, activeOrganization.groupMembers, filters),
    [
      data,
      activeOrganization.groupMembers,
      filters?.query,
      filters?.byGroupId,
      filters?.excludeByGroupId,
      filters?.excludeOwners,
    ],
  );

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
