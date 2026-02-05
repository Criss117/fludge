import { orpc } from "@/integrations/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMutateOrganizations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    ...orpc.organizations.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.organizations.findAll.queryOptions());
    },
  });

  return { create };
}
