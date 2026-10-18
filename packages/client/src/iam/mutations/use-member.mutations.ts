import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useMutation } from "@tanstack/react-query";

import { useInvalidateGroups } from "../queries/use-find-groups";
import { useInvalidateMembers } from "../queries/use-find-members";

export function useRegisterMember() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.auth.commands.signUpMember.mutationOptions({
      onSuccess: async (member) => {
        unwrapResult(await iamContainer.repositories.memberRepository.save(member));

        invalidateMembers.invalidateList();
      },
    }),
  );
}

export function useAssignGroupsToMember() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateMembers = useInvalidateMembers();
  const invalidateGroups = useInvalidateGroups();

  return useMutation(
    orpc.member.commands.assignGroups.mutationOptions({
      onSuccess: async (groups, variables) => {
        unwrapResult(await iamContainer.repositories.groupRepository.save(groups));

        invalidateMembers.invalidateDetail(variables.memberId);
        variables.groupIds.forEach((groupId) => invalidateGroups.invalidateDetail(groupId));
      },
    }),
  );
}

export function useRemoveGroupsFromMember() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateMembers = useInvalidateMembers();
  const invalidateGroups = useInvalidateGroups();

  return useMutation(
    orpc.member.commands.removeGroups.mutationOptions({
      onSuccess: async (groups, variables) => {
        unwrapResult(await iamContainer.repositories.groupRepository.save(groups));

        invalidateMembers.invalidateDetail(variables.memberId);
        variables.groupIds.forEach((groupId) => invalidateGroups.invalidateDetail(groupId));
      },
    }),
  );
}
