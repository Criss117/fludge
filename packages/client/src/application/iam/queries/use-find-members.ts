import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { FindAllMembersFilters } from "../domain/member.repository";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";

function normalizeFilters(filters?: FindAllMembersFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    excludeIds: filters?.excludeIds?.length
      ? [...filters.excludeIds].sort()
      : undefined,
  };
}

export const { keys: membersKeys, useInvalidateQueries: useInvalidateMembers } =
  keysGenerator({
    module: "catalog",
    resource: "categories",
    normalizeFilters,
  });

export function useFindAllMembers(filters?: FindAllMembersFilters) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: membersKeys.filteredList(activeOrganization.id, filters),
    queryFn: () =>
      iamContainer.repositories.memberRepository.findAll(
        activeOrganization.id,
        filters,
      ),
  });
}

export function useFindMemberDetail(memberId: string) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: membersKeys.detail(activeOrganization.id, memberId),
    queryFn: () =>
      iamContainer.repositories.memberRepository.findOneById(
        activeOrganization.id,
        memberId,
      ),
  });
}
