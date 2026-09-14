import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useMutation } from "@tanstack/react-query";
import { useContainer } from "@fludge/client/providers/container.provider";
import {
  useInvalidateOrganizations,
  useOrganization,
} from "@fludge/client/providers/organization.provider";

export function useRegisterOrganization() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateOrganizations = useInvalidateOrganizations();
  const { switchOrganization } = useOrganization();

  return useMutation(
    orpc.organization.commands.register.mutationOptions({
      onSuccess: async (organization) => {
        await switchOrganization(organization.id);

        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateOrganizations.invalidateAll();
      },
    }),
  );
}

export function useUpdateOrganization() {
  const invalidateOrganizations = useInvalidateOrganizations();
  const { iamContainer } = useContainer();
  const orpc = useOrpc();

  return useMutation(
    orpc.organization.commands.update.mutationOptions({
      onSuccess: async (organization) => {
        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        invalidateOrganizations.invalidateAll();
      },
    }),
  );
}
