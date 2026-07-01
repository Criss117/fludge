import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { useCategoryCollection } from "@fludge/client/application/catalog/hooks/use-categories-collection";
import type { CategorySummary } from "@fludge/client/application/catalog/hooks/use-find-categories";
import { toast } from "@fludge/ui/lib/toast";

const DELETE_CATEGORY_TOASTS = {
  loading: "Eliminando categoría...",
  success: "Categoría eliminada",
  error: "Error al eliminar categoría",
} as const;

const ACTIVATE_CATEGORY_TOASTS = {
  loading: "Activando categoría...",
  success: "Categoría activada",
  error: "Error al activar categoría",
} as const;

const DEACTIVATE_CATEGORY_TOASTS = {
  loading: "Desactivando categoría...",
  success: "Categoría desactivada",
  error: "Error al desactivar categoría",
} as const;

type Params = {
  organizationId: string;
};

export function useCategoryActionsMutations({ organizationId }: Params) {
  const { categoryCollection } = useCategoryCollection(organizationId);
  const toastIdRef = useRef<string | number>(undefined);

  const deleteCategory = useMutation({
    mutationKey: ["catalog", "category", "delete"],
    mutationFn: async (category: CategorySummary) => {
      const tx = categoryCollection.delete(category.id);
      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DELETE_CATEGORY_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(DELETE_CATEGORY_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(DELETE_CATEGORY_TOASTS.error, { id: toastIdRef.current });
    },
  });

  const activateCategory = useMutation({
    mutationKey: ["catalog", "category", "activate"],
    mutationFn: async (category: CategorySummary) => {
      // Activate is just an update clearing deletedAt — routed through the
      // collection's onUpdate so it uses the same PATCH /categories endpoint.
      const tx = categoryCollection.update(category.id, (draft) => {
        draft.deletedAt = null;
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(ACTIVATE_CATEGORY_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(ACTIVATE_CATEGORY_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(ACTIVATE_CATEGORY_TOASTS.error, {
        id: toastIdRef.current,
      });
    },
  });

  const deactivateCategory = useMutation({
    mutationKey: ["catalog", "category", "deactivate"],
    mutationFn: async (category: CategorySummary) => {
      // Deactivate is just an update setting deletedAt — same PATCH
      // /categories endpoint, no dedicated command or route.
      const tx = categoryCollection.update(category.id, (draft) => {
        draft.deletedAt = new Date();
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DEACTIVATE_CATEGORY_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(DEACTIVATE_CATEGORY_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(DEACTIVATE_CATEGORY_TOASTS.error, {
        id: toastIdRef.current,
      });
    },
  });

  return {
    deleteCategory: deleteCategory.mutate,
    activateCategory: activateCategory.mutate,
    deactivateCategory: deactivateCategory.mutate,
  };
}