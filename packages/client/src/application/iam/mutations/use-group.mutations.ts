import { useMutation } from "@tanstack/react-query";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useInvalidateGroups } from "../queries/use-find-groups";
import { useInvalidateMembers } from "../queries/use-find-members";

export function useCreateGroup() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateGroups = useInvalidateGroups();

  return useMutation(
    orpc.group.commands.create.mutationOptions({
      onSuccess: async (organization) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateGroups.invalidateList();
      },
    }),
  );
}

export function useUpdateGroup() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateGroups = useInvalidateGroups();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.group.commands.update.mutationOptions({
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateGroups.invalidateList();
        invalidateGroups.invalidateDetail(variables.id);
        invalidateMembers.invalidateDetail();
      },
    }),
  );
}

export function useDeleteGroup() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateGroups = useInvalidateGroups();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.group.commands.delete.mutationOptions({
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.groupRepository.delete(
          organization.id,
          variables.groupIds,
        );

        invalidateGroups.invalidateList();
        variables.groupIds.forEach((groupId) =>
          invalidateGroups.invalidateDetail(groupId),
        );

        invalidateMembers.invalidateDetail();
      },
    }),
  );
}

export function useAssignMembersToGroup() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateGroups = useInvalidateGroups();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.group.commands.assignMembers.mutationOptions({
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateGroups.invalidateDetail(variables.groupId);
        variables.memberIds.forEach((memberId) =>
          invalidateMembers.invalidateDetail(memberId),
        );
      },
    }),
  );
}

export function useRemoveMembersFromGroup() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateGroups = useInvalidateGroups();
  const invalidateMembers = useInvalidateMembers();

  return useMutation(
    orpc.group.commands.removeMembers.mutationOptions({
      onSuccess: async (organization, variables) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateGroups.invalidateDetail(variables.groupId);
        variables.memberIds.forEach((memberId) =>
          invalidateMembers.invalidateDetail(memberId),
        );
      },
    }),
  );
}
