import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { useProductCollection } from "@fludge/client/application/catalog/hooks/use-product-collection";
import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";
import { toast } from "@fludge/ui/lib/toast";

const ACTIVATE_PRODUCT_TOASTS = {
  loading: "Activando producto...",
  success: "Producto activado",
  error: "Error al activar producto",
} as const;

const DEACTIVATE_PRODUCT_TOASTS = {
  loading: "Desactivando producto...",
  success: "Producto desactivado",
  error: "Error al desactivar producto",
} as const;

const DISCONTINUE_PRODUCT_TOASTS = {
  loading: "Descontinuando producto...",
  success: "Producto descontinuado",
  error: "Error al descontinuar producto",
} as const;

type Params = {
  organizationId: string;
};

export function useProductActionsMutations({ organizationId }: Params) {
  const { productCollection } = useProductCollection(organizationId);
  const toastIdRef = useRef<string | number>(undefined);

  const activateProduct = useMutation({
    mutationKey: ["catalog", "product", "activate"],
    mutationFn: async (product: ProductSummary) => {
      const tx = productCollection.update(product.id, (draft) => {
        draft.status = "active";
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(ACTIVATE_PRODUCT_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(ACTIVATE_PRODUCT_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(ACTIVATE_PRODUCT_TOASTS.error, { id: toastIdRef.current });
    },
  });

  const deactivateProduct = useMutation({
    mutationKey: ["catalog", "product", "deactivate"],
    mutationFn: async (product: ProductSummary) => {
      const tx = productCollection.update(product.id, (draft) => {
        draft.status = "inactive";
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DEACTIVATE_PRODUCT_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(DEACTIVATE_PRODUCT_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(DEACTIVATE_PRODUCT_TOASTS.error, { id: toastIdRef.current });
    },
  });

  const discontinueProduct = useMutation({
    mutationKey: ["catalog", "product", "discontinue"],
    mutationFn: async (product: ProductSummary) => {
      const tx = productCollection.update(product.id, (draft) => {
        draft.status = "discontinued";
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(DISCONTINUE_PRODUCT_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(DISCONTINUE_PRODUCT_TOASTS.success, {
        id: toastIdRef.current,
      });
    },
    onError: () => {
      toast.error(DISCONTINUE_PRODUCT_TOASTS.error, {
        id: toastIdRef.current,
      });
    },
  });

  return {
    activateProduct: activateProduct.mutate,
    deactivateProduct: deactivateProduct.mutate,
    discontinueProduct: discontinueProduct.mutate,
  };
}