import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

import { useORPC } from "@fludge/client/providers/orpc.provider";

export const registerOrganizationSchema = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  phone: z
    .string({
      error: "El teléfono es requerido",
    })
    .min(9, {
      error: "El teléfono es muy corto",
    })
    .max(15, {
      error: "El teléfono es muy largo",
    }),
  legalName: z
    .string({
      error: "La razón social es requerida",
    })
    .min(3, {
      error: "La razón social es muy corta",
    })
    .max(50, {
      error: "La razón social es muy larga",
    }),
  taxId: z
    .string({
      error: "El NIT es requerido",
    })
    .min(9, {
      error: "El NIT es muy corto",
    })
    .max(15, {
      error: "El NIT es muy largo",
    }),
  address: z
    .string({
      error: "La dirección es requerida",
    })
    .min(5, {
      error: "La dirección es muy corta",
    })
    .max(50, {
      error: "La dirección es muy larga",
    }),
});

export type RegisterOrganizationSchema = z.infer<
  typeof registerOrganizationSchema
>;

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
        onChange: registerOrganizationSchema,
      },
      onSubmit: ({ value, formApi }) => {
        registerOrganizationMutation.mutate(value, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey:
                orpc.organizations.queries.findAll.queryOptions().queryKey,
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
