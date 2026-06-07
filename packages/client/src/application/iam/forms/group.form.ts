import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";
import { useGroupCollection } from "../hooks/use-group-collection";
import { slugify } from "@fludge/utils/slugify";
import { useMutation } from "@tanstack/react-query";

const groupFormSchema = z.object({
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
  description: z.string(),
  permissions: z.enum(ALL_PERMISSIONS).array().min(1, {
    error: "Debes asignar al menos un permiso",
  }),
});

type GroupFormSchema = z.infer<typeof groupFormSchema>;

export type OnCreateGroupSubmit = {
  onSubmit: (options: {
    value: GroupFormSchema;
    resetForm: () => void;
  }) => void;
};

type Actions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useCreateGroupFormOptions(
  organizationId: string,
  actions?: Actions,
) {
  const { groupCollection } = useGroupCollection(organizationId);

  const insertGroupMutation = useMutation({
    mutationKey: ["iam", "group", "insert"],
    mutationFn: async (value: GroupFormSchema) => {
      const now = new Date();

      const tx = groupCollection.insert({
        id: "xd",
        organizationId: organizationId,
        name: value.name,
        slug: slugify(value.name),
        description: value.description,
        permissions: value.permissions,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        deletedAt: null,
      });

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      actions?.onSuccess?.();
    },
    onError: (error) => {
      actions?.onError?.(error);
    },
  });

  return formOptions({
    defaultValues: {
      name: "",
      description: "",
      permissions: [] as GroupFormSchema["permissions"],
    },
    validators: {
      onChange: groupFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      insertGroupMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}
