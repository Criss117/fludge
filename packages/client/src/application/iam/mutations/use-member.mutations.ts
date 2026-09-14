import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateMembers } from "../queries/use-find-members";
import { useInvalidateGroups } from "../queries/use-find-groups";

export function useRegisterMember() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.auth.commands.signUpMember.mutationOptions({
      onSuccess: async (organization) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

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
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateMembers.invalidateDetail(variables.memberId);
        variables.groupIds.forEach((groupId) =>
          invalidateGroups.invalidateDetail(groupId),
        );
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
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateMembers.invalidateDetail(variables.memberId);
        variables.groupIds.forEach((groupId) =>
          invalidateGroups.invalidateDetail(groupId),
        );
      },
    }),
  );
}
