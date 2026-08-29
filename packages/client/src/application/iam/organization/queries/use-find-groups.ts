import { useMemo } from "react";
import { useFindActiveOrganization } from "./use-find-organization";

type Filters = {
  query: string;
  byMemberId?: string;
};

export function useFindAllGroups(filters?: Filters) {
  const { data, ...rest } = useFindActiveOrganization();

  const groups = useMemo(() => {
    const groups = data.groups.map((group) => ({
      ...group,
      members: data.groupMembers
        .filter((gm) => gm.groupId === group.id)
        .map((gm) => gm.memberId),
    }));

    if (!filters?.query && !filters?.byMemberId) return groups;

    const query = filters?.query;
    const byMemberId = filters?.byMemberId;

    const filterByquery = query
      ? groups.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      : groups;

    const filterByMemberId = byMemberId
      ? filterByquery.filter((d) => d.members.includes(byMemberId))
      : filterByquery;

    return filterByMemberId;
  }, [data.groups, data.groupMembers, filters?.query, filters?.byMemberId]);

  return { data: groups, ...rest };
}

export function useFindGroup(groupId: string) {
  const { data, ...rest } = useFindAllGroups();

  const group = data.find((d) => d.id === groupId);

  if (!group) throw new Error("Grupo no encontrado");

  return {
    data: { ...group },
    ...rest,
  };
}

export type GroupSummary = ReturnType<typeof useFindAllGroups>["data"][number];
