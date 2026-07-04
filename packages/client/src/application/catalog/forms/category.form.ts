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

/**
 * Client-side form schema — independent from the API command schema.
 * The backend generates the canonical slug from `name`, so the form
 * does NOT send `slug`. `parentId` is a string from the `<select>`;
 * `"__none__"` is the "no parent" sentinel (non-empty so Base UI
 * Select reliably fires `onValueChange`) and is normalized to `null`
 * at the schema boundary.
 *
 * NOTE: TanStack Form uses the schema for VALIDATION only — it does
 * NOT overwrite the field value with the schema's transformed output.
 * The field keeps the raw `"__none__"` / UUID string; the mutation
 * handlers below map `"__none__" => null` explicitly so `null` reaches
 * the collection / API instead of collapsing to `undefined`.
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
    .transform((v) => (v === "__none__" ? null : v))
    .pipe(z.uuid().nullable()),
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

      // The slug is computed locally for the optimistic row only.
      // The server returns the authoritative category (with its own
      // slug) and replaces this row via `collection.utils.writeInsert`.
      const tx = categoryCollection.insert({
        id: crypto.randomUUID(),
        organizationId: organizationId,
        name: value.name,
        slug: slugify(value.name),
        // TanStack Form keeps the raw sentinel string; map it to null
        // here so the collection draft carries "clear parent" intent.
        parentId:
          value.parentId === "__none__" ? null : value.parentId ?? null,
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
      parentId: "__none__",
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

      const tx = categoryCollection.update(defaultValues.categoryId, (draft) => {
        draft.name = value.name;
        // Map the "__none__" sentinel to null so the collection / API
        // can distinguish "clear parent" (null) from a UUID move.
        draft.parentId =
          value.parentId === "__none__" ? null : value.parentId ?? null;
        draft.updatedAt = now;
      });

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
      parentId: defaultValues.parentId ?? "__none__",
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
