import { useContainer } from "@fludge/client/providers/container.provider";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useFindOrganizations() {
  const { iamContainer } = useContainer();

  return useSuspenseQuery({
    queryKey: ["iam", "organizations"],
    queryFn: async () =>
      unwrapResult(await iamContainer.repositories.organizationRepository.findAll()),
  });
}

export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    return queryClient.invalidateQueries({
      queryKey: ["iam", "organizations"],
    });
  };

  return {
    invalidateAll,
  };
}
