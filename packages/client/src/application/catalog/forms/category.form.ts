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

/**
 * Client-side form schema — independent from the API command schema.
 * The backend generates the canonical slug from `name`, so the form
 * does NOT send `slug`. `parentId` is a string from the `<select>`;
 * `""` is the natural "no parent" sentinel and is normalized to
 * `undefined` at the schema boundary.
 */
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
  parentId: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.uuid().optional()),
});

type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

type CreateFormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
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

      // The slug is computed locally for the optimistic row only.
      // The server returns the authoritative category (with its own
      // slug) and replaces this row via `collection.utils.writeInsert`.
      const tx = categoryCollection.insert({
        id: crypto.randomUUID(),
        organizationId: organizationId,
        name: value.name,
        slug: slugify(value.name),
        parentId: value.parentId || null,
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
      parentId: "",
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
