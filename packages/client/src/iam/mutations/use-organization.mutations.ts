import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { unwrapResult } from "@fludge/utils/trycatch";
import { useMutation } from "@tanstack/react-query";

import { useAppState } from "../hooks/use-app-state";
import { useInvalidateOrganizations } from "../queries/use-find-organizations";

export function useRegisterOrganization() {
  const orpc = useOrpc();
  const { iamContainer } = useContainer();
  const invalidateOrganizations = useInvalidateOrganizations();
  const { switchActiveOrganization } = useAppState();

  return useMutation(
    orpc.organization.commands.register.mutationOptions({
      onSuccess: async ({ organization, group, member }) => {
        unwrapResult(await iamContainer.repositories.organizationRepository.save(organization));

        unwrapResult(await iamContainer.repositories.groupRepository.save(group));

        unwrapResult(await iamContainer.repositories.memberRepository.save(member));

        await switchActiveOrganization.mutateAsync({
          activeOrganizationId: organization.id,
        });

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
        unwrapResult(await iamContainer.repositories.organizationRepository.save(organization));

        invalidateOrganizations.invalidateAll();
      },
    }),
  );
}
