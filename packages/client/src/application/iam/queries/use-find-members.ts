import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  type FindAllMembersFilters,
  normalizeFilters,
} from "../domain/member.repository";

export const membersKeys = {
  all: (orgId: string) => ["iam", "organizations", orgId, "members"] as const,
  list: (orgId: string, filters?: FindAllMembersFilters) =>
    [...membersKeys.all(orgId), "list", normalizeFilters(filters)] as const,
  detail: (orgId: string, memberId?: string) => [
    ...membersKeys.all(orgId),
    "detail",
    memberId,
  ],
};

export function useFindAllMembers(filters?: FindAllMembersFilters) {
  const { iamContainer } = useContainer();
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: membersKeys.list(activeOrganization.id, filters),
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

export function useInvalidateMembers() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();

  if (!activeOrganization) throw new Error("Active organization not found");

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: membersKeys.all(activeOrganization.id),
    });
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: membersKeys.list(activeOrganization.id),
    });
  };

  const invalidateDetail = (memberId?: string) => {
    queryClient.invalidateQueries({
      queryKey: membersKeys.detail(activeOrganization.id, memberId),
    });
  };

  return { invalidateAll, invalidateDetail, invalidateList };
}
