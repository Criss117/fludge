import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  normalizeFilters,
  type FindAllGroupsFilters,
} from "../domain/group.repository";

export const groupKeys = {
  all: (orgId: string) => ["iam", "organizations", orgId, "groups"] as const,
  list: (orgId: string, filters?: FindAllGroupsFilters) =>
    [...groupKeys.all(orgId), "list", normalizeFilters(filters)] as const,
  detail: (orgId: string, groupId?: string) => [
    ...groupKeys.all(orgId),
    "detail",
    groupId,
  ],
};

export function useFindAllGroups(filters?: FindAllGroupsFilters) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: groupKeys.list(activeOrganization.id, filters),
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

export function useInvalidateGroups() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();

  if (!activeOrganization) throw new Error("Active organization not found");

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: groupKeys.all(activeOrganization.id),
    });
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: groupKeys.list(activeOrganization.id),
    });
  };

  const invalidateDetail = (groupId?: string) => {
    queryClient.invalidateQueries({
      queryKey: groupKeys.detail(activeOrganization.id, groupId),
    });
  };

  return { invalidateAll, invalidateDetail, invalidateList };
}
