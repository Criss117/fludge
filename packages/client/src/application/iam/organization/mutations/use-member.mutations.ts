import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFindOrganizationsQueryOptions } from "../queries/use-find-organization";

export function useRegisterMember() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.auth.commands.signUpMember.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
        await queryClient.invalidateQueries(
          orpc.member.queries.findAll.queryOptions(),
        );
      },
    }),
  );
}

export function useRemoveGroupsFromMember() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.member.commands.removeGroups.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}
