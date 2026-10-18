import { useContainer } from "@fludge/client/providers/container.provider";
import { keysGenerator } from "@fludge/client/shared/use-invalidate-queries";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { FindAllMembersFilters } from "../domain/member.repository";
import { useAppState } from "../hooks/use-app-state";

function normalizeFilters(filters?: FindAllMembersFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    excludeIds: filters?.excludeIds?.length ? [...filters.excludeIds].sort() : undefined,
  };
}

export const { keys: membersKeys, useInvalidateQueries: useInvalidateMembers } = keysGenerator({
  module: "iam",
  resource: "members",
  normalizeFilters,
});

export function useFindAllMembers(filters?: FindAllMembersFilters) {
  const { iamContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: membersKeys.filteredList(activeOrganization.id, filters),
    queryFn: async () =>
      unwrapResult(
        await iamContainer.repositories.memberRepository.findAll(activeOrganization.id, filters),
      ),
  });
}

export function useFindMemberDetail(memberId: string) {
  const { iamContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: membersKeys.detail(activeOrganization.id, memberId),
    queryFn: async () =>
      unwrapResult(
        await iamContainer.repositories.memberRepository.findOneById(
          activeOrganization.id,
          memberId,
        ),
      ),
  });
}
