import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

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

export function useCreateGroupFormOptions() {
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
      console.log(value);
    },
  });
}
