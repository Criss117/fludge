import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { FindAllGroupsFilters } from "../domain/group.repository";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";

function normalizeFilters(filters?: FindAllGroupsFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    excludeIds: filters?.excludeIds?.length
      ? [...filters.excludeIds].sort()
      : undefined,
  };
}

export const { keys: groupKeys, useInvalidateQueries: useInvalidateGroups } =
  keysGenerator({
    module: "iam",
    resource: "groups",
    normalizeFilters,
  });

export function useFindAllGroups(filters?: FindAllGroupsFilters) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: groupKeys.filteredList(activeOrganization.id, filters),
    queryFn: () =>
      iamContainer.repositories.groupRepository.findAll(
        activeOrganization.id,
        filters,
      ),
  });
}

export function useFindGroupDetail(groupId: string) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: groupKeys.detail(activeOrganization.id, groupId),
    queryFn: () =>
      iamContainer.repositories.groupRepository.findOneById(
        activeOrganization.id,
        groupId,
      ),
  });
}
