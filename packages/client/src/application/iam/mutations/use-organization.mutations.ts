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
      onSuccess: async ({ organization, group, member }) => {
        await switchOrganization(organization.id);

        await iamContainer.repositories.organizationRepository.save(
          organization,
        );

        await iamContainer.repositories.groupRepository.save(group);

        await iamContainer.repositories.memberRepository.save(member);

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
