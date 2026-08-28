import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRegisterMember() {
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.auth.commands.signUpMember.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(
          orpc.organization.queries.findActive.queryKey(),
          organization,
        );
        await queryClient.invalidateQueries(
          orpc.member.queries.findAll.queryOptions(),
        );
      },
    }),
  );
}
