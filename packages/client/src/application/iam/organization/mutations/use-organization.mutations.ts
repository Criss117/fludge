import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  findActiveOrganizationOptions,
  findAllOrganizationsOptions,
  useFindOrganizationsQueryOptions,
} from "../queries/use-find-organization";

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

        const { data: sessionData } = await session.refetch();

        queryClient.invalidateQueries(
          findAllOrganizationsOptions(orpc, sessionData?.user.id!),
        );

        queryClient.setQueryData(
          findActiveOrganizationOptions(
            orpc,
            sessionData?.user.id!,
            organization.id,
          ).queryKey,
          organization,
        );
      },
    }),
  );
}

export function useUpdateOrganization() {
  const { findActiveOptions } = useFindOrganizationsQueryOptions();
  const queryClient = useQueryClient();
  const orpc = useOrpc();

  return useMutation(
    orpc.organization.commands.update.mutationOptions({
      onSuccess: async (organization) => {
        queryClient.setQueryData(findActiveOptions.queryKey, organization);
      },
    }),
  );
}
