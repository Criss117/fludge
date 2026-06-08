import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { formOptions } from "@tanstack/react-form";

import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useMemberCollection } from "../hooks/use-member-collection";

const registerMemberSchema = z
  .object({
    email: z.email({
      error: "El email es requerido",
    }),
    password: z
      .string({
        error: "La contraseña es requerida",
      })
      .min(8, {
        error: "La contraseña es muy corta",
      })
      .max(50, {
        error: "La contraseña es muy larga",
      }),
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
  })
  .extend({
    groupIds: z
      .array(
        z.uuid({
          error: "El id no es válido",
        }),
      )
      .min(1, {
        error: "Debe seleccionar al menos un grupo",
      }),
  });

export type RegisterMemberSchema = z.infer<typeof registerMemberSchema>;

type RegisterMemberFormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useRegisterMemberFormOptions({
  organizationId,
  onSuccess,
  onError,
}: RegisterMemberFormParams) {
  const { orpc } = useORPC();
  const { memberCollection } = useMemberCollection(organizationId);

  const registerMemberMutation = useMutation(
    orpc.members.commands.register.mutationOptions({
      onSuccess: (values) => {
        memberCollection.utils.writeInsert({
          organizationId,
          id: values.id,
          userId: values.id,
          createdAt: values.createdAt,
          role: values.role,
          assignedBy: values.assignedBy,
          user: {
            email: values.user.email,
            name: values.user.name,
          },
        });
        onSuccess?.();
      },
      onError: (error) => {
        onError?.(error);
      },
    }),
  );

  return formOptions({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
      groupIds: [] as RegisterMemberSchema["groupIds"],
    },
    validators: {
      onChange: registerMemberSchema,
    },
    onSubmit: ({ value, formApi }) => {
      registerMemberMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}
