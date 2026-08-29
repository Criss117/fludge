import { appStatementSchema } from "@fludge/utils/permissions/index";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const groupSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { error: "El nombre no puede exceder 50 caracteres" }),
  description: z.string({ error: "La descripción es requerida" }),
  permissions: appStatementSchema,
});

export type GroupSchema = z.infer<typeof groupSchema>;

export type OnGroupSubmit = {
  onSubmit: (options: { value: GroupSchema; resetForm: () => void }) => void;
};

export function groupFormOptions(
  options: OnGroupSubmit,
  defaultValues?: GroupSchema,
) {
  return formOptions({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      permissions:
        defaultValues?.permissions ?? ({} as GroupSchema["permissions"]),
    },
    validators: {
      onChange: groupSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
