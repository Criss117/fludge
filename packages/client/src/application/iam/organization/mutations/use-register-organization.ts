import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRegisterOrganization() {
  const queryClient = useQueryClient();
  const orpc = useOrpc();
  const { session, setActiveOrganization } = useAuth();

  return useMutation(
    orpc.organization.commands.register.mutationOptions({
      onSuccess: async (organization) => {
        await setActiveOrganization.mutateAsync({
          organizationId: organization.id,
        });

        await session.refetch();

        queryClient.invalidateQueries(
          orpc.organization.queries.findAll.queryOptions(),
        );

        queryClient.setQueryData(
          orpc.organization.queries.findActive.queryKey(),
          organization,
        );
      },
    }),
  );
}
