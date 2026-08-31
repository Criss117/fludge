import { useMemo } from "react";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
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

type MemberFilters = {
  query?: string;
  byGroup?: {
    groupId: string;
    type: "include" | "exclude";
  };
};

export function useFindAllMembers(filters?: MemberFilters) {
  const { findAllOptions } = useFindMembersQueryOptions();

  const { data, ...rest } = useSuspenseQuery(findAllOptions);
  const { data: activeOrganization } = useFindActiveOrganization();

  const members = useMemo(() => {
    const membersWithGroups = data.map((m) => ({
      ...m,
      groups: activeOrganization.groupMembers
        .filter((gm) => gm.memberId === m.id)
        .map((gm) => gm.groupId),
    }));

    const query = filters?.query;
    const byGroup = filters?.byGroup;

    if (!query && !byGroup) return membersWithGroups;

    const filterByquery = query
      ? membersWithGroups.filter(
          (d) =>
            d.user.name.toLowerCase().includes(query.toLowerCase()) ||
            d.user.email.toLowerCase().includes(query.toLowerCase()) ||
            d.user.phone.toLowerCase().includes(query.toLowerCase()),
        )
      : membersWithGroups;

    if (!byGroup) return filterByquery;

    const filterByGroupId = byGroup
      ? filterByquery.filter((d) => {
          const include = d.groups.includes(byGroup.groupId);

          return byGroup.type === "include" ? include : !include;
        })
      : filterByquery;

    return filterByGroupId;
  }, [data, activeOrganization.groupMembers, filters?.query, filters?.byGroup]);

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
