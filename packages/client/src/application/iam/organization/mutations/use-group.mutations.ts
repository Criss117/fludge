import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useFindOrganizationsQueryOptions } from "../queries/use-find-organization";

export function useCreateGroup() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.group.commands.create.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}

export function useUpdateGroup() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.group.commands.update.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}

export function useDeleteGroup() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.group.commands.delete.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}

export function useAssignMembersToGroup() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.group.commands.assignMembers.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}

export function useRemoveMembersFromGroup() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.group.commands.removeMembers.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}
