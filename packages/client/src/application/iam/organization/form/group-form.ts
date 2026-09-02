import { createGroupValidator } from "@fludge/utils/validators/group.validators";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export type GroupSchema = z.infer<typeof createGroupValidator>;

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
      onChange: createGroupValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
