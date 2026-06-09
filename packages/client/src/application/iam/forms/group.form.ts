import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { formOptions } from "@tanstack/react-form";

import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";
import { useGroupCollection } from "@fludge/client/application/iam/hooks/use-group-collection";
import { slugify } from "@fludge/utils/slugify";

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

type CreateFormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

type UpdateFormParams = CreateFormParams & {
  defaultValues: GroupFormSchema & {
    groupId: string;
  };
};

export type GroupFormDefaultValues = GroupFormSchema & {
  groupId: string;
};

export function useCreateGroupFormOptions({
  organizationId,
  onSuccess,
  onError,
}: CreateFormParams) {
  const { groupCollection } = useGroupCollection(organizationId);

  const insertGroupMutation = useMutation({
    mutationKey: ["iam", "group", "insert"],
    mutationFn: async (value: GroupFormSchema) => {
      const now = new Date();

      const tx = groupCollection.insert({
        id: crypto.randomUUID(),
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
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
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

export function useUpdateGroupFormOptions({
  organizationId,
  defaultValues,
  onSuccess,
  onError,
}: UpdateFormParams) {
  const { groupCollection } = useGroupCollection(organizationId);

  const updateGroupMutation = useMutation({
    mutationKey: ["iam", "group", "insert"],
    mutationFn: async (value: GroupFormSchema) => {
      const now = new Date();

      const tx = groupCollection.update(defaultValues.groupId, (draft) => {
        draft.name = value.name;
        draft.description = value.description;
        draft.permissions = value.permissions;
        draft.updatedAt = now;
      });

      await tx.isPersisted.promise;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return formOptions({
    defaultValues: {
      name: defaultValues.name,
      description: defaultValues.description,
      permissions: defaultValues.permissions,
    },
    validators: {
      onChange: groupFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      updateGroupMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}
