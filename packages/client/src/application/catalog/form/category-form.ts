import { createCategoryValidator } from "@fludge/utils/validators/category.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import type { z } from "zod";

export type CategorySchema = z.infer<typeof createCategoryValidator>;

export type OnCategorySubmit = {
  onSubmit: (options: { value: CategorySchema; resetForm: () => void }) => void;
};

export function categoryFormOptions(options: OnCategorySubmit) {
  return formOptions({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onChange: createCategoryValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useCategoryForm(options: OnCategorySubmit) {
  return useForm(categoryFormOptions(options));
}
