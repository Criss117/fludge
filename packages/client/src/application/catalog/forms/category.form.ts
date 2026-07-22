import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { formOptions } from "@tanstack/react-form";

import { useCategoryCollection } from "@fludge/client/application/catalog/hooks/use-categories-collection";
import { toast } from "@fludge/ui/lib/toast";
import { slugify } from "@fludge/utils/slugify";

const CREATE_CATEGORY_TOASTS = {
  loading: "Creando categoría...",
  success: "Categoría creada",
  error: "Error al crear categoría",
} as const;

const UPDATE_CATEGORY_TOASTS = {
  loading: "Actualizando categoría...",
  success: "Categoría actualizada",
  error: "Error al actualizar categoría",
} as const;

const categoryFormSchema = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(1, {
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  description: z
    .string()
    .min(5, {
      error: "La descripción es muy corta",
    })
    .max(255, {
      error: "La descripción es muy larga",
    })
    .or(z.literal("")),
});

type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

type CreateFormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

type UpdateFormParams = CreateFormParams & {
  defaultValues: CategoryFormSchema & {
    categoryId: string;
  };
};

export type CategoryFormDefaultValues = CategoryFormSchema & {
  categoryId: string;
};

export function useCreateCategoryFormOptions({
  organizationId,
  onSuccess,
  onError,
}: CreateFormParams) {
  const { categoryCollection } = useCategoryCollection(organizationId);
  const toastIdRef = useRef<string | number>(undefined);

  const insertCategoryMutation = useMutation({
    mutationKey: ["catalog", "category", "insert"],
    mutationFn: async (value: CategoryFormSchema) => {
      const now = new Date();

      const tx = categoryCollection.insert({
        id: crypto.randomUUID(),
        organizationId: organizationId,
        name: value.name,
        slug: slugify(value.name),
        description: value.description,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        deletedAt: null,
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(CREATE_CATEGORY_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(CREATE_CATEGORY_TOASTS.success, { id: toastIdRef.current });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(CREATE_CATEGORY_TOASTS.error, { id: toastIdRef.current });
      onError?.(error);
    },
  });

  return formOptions({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onChange: categoryFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      insertCategoryMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}

export function useUpdateCategoryFormOptions({
  organizationId,
  defaultValues,
  onSuccess,
  onError,
}: UpdateFormParams) {
  const { categoryCollection } = useCategoryCollection(organizationId);
  const toastIdRef = useRef<string | number>(undefined);

  const updateCategoryMutation = useMutation({
    mutationKey: ["catalog", "category", "update"],
    mutationFn: async (value: CategoryFormSchema) => {
      const now = new Date();

      const tx = categoryCollection.update(
        defaultValues.categoryId,
        (draft) => {
          draft.name = value.name;
          draft.updatedAt = now;
        },
      );

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(UPDATE_CATEGORY_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(UPDATE_CATEGORY_TOASTS.success, {
        id: toastIdRef.current,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(UPDATE_CATEGORY_TOASTS.error, { id: toastIdRef.current });
      onError?.(error);
    },
  });

  return formOptions({
    defaultValues: {
      name: defaultValues.name,
      description: defaultValues.description,
    },
    validators: {
      onChange: categoryFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      updateCategoryMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}
