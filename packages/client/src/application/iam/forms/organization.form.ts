import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

import { useORPC } from "@fludge/client/providers/orpc.provider";
import { registerOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/register-organization.command";

export type RegisterOrganizationSchema = z.infer<typeof registerOrganizationCommand>;

type RegisterOrganizationFormParams = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useRegisterOrganizationFormOptions({
  onSuccess,
  onError,
}: RegisterOrganizationFormParams) {
  const { orpc } = useORPC();
  const queryClient = useQueryClient();

  const registerOrganizationMutation = useMutation(
    orpc.organizations.commands.register.mutationOptions(),
  );

  return {
    formOptions: formOptions({
      defaultValues: {
        name: "",
        phone: "",
        legalName: "",
        taxId: "",
        address: "",
      } as RegisterOrganizationSchema,
      validators: {
        onChange: registerOrganizationCommand,
      },
      onSubmit: ({ value, formApi }) => {
        registerOrganizationMutation.mutate(value, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: orpc.organizations.queries.findAll.queryOptions().queryKey,
            });
            formApi.reset();
            onSuccess?.();
          },
          onError: (error) => {
            onError?.(error);
          },
        });
      },
    }),
    mutation: registerOrganizationMutation,
  };
}