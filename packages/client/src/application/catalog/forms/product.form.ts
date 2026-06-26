import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { formOptions } from "@tanstack/react-form";

import { useProductCollection } from "@fludge/client/application/catalog/hooks/use-product-collection";
import { toast } from "@fludge/ui/lib/toast";
import { slugify } from "@fludge/utils/slugify";

const CREATE_PRODUCT_TOASTS = {
  loading: "Creando producto...",
  success: "Producto creado",
  error: "Error al crear producto",
} as const;

/**
 * Client-side form schema — independent from the API command schema.
 *
 * The backend generates the canonical slug from `name`, so the form
 * does NOT send `slug`. `categoryId` and `sku` arrive as strings from
 * the UI controls; empty strings are normalized to `undefined` at the
 * schema boundary (the `""` sentinel is the natural "no value" state
 * for a text `<input>`/`<select>`).
 *
 * Prices are kept as strings to preserve the exact decimal representation
 * the user types (e.g. "10.50"); the API persists them as `numeric(12,2)`.
 */
const productFormSchema = z.object({
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
    .max(100, {
      error: "El nombre es muy largo",
    }),
  barcode: z
    .string({
      error: "El código de barras es requerido",
    })
    .min(1, {
      error: "El código de barras es requerido",
    })
    .max(50, {
      error: "El código de barras es muy largo",
    }),
  sku: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().min(1).max(50).optional()),
  pricePurchase: z
    .string({ error: "El precio de compra es requerido" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "El precio de compra no es válido",
    }),
  priceWholesale: z
    .string({ error: "El precio mayorista es requerido" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "El precio mayorista no es válido",
    }),
  priceRetail: z
    .string({ error: "El precio de venta es requerido" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "El precio de venta no es válido",
    }),
  categoryId: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.uuid().optional()),
});

type ProductFormSchema = z.infer<typeof productFormSchema>;

type CreateFormParams = {
  organizationId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useCreateProductFormOptions({
  organizationId,
  onSuccess,
  onError,
}: CreateFormParams) {
  const { productCollection } = useProductCollection(organizationId);
  const toastIdRef = useRef<string | number>(undefined);

  const insertProductMutation = useMutation({
    mutationKey: ["catalog", "product", "insert"],
    mutationFn: async (value: ProductFormSchema) => {
      const now = new Date();

      // The slug is computed locally for the optimistic row only.
      // The server returns the authoritative product (with its own
      // slug) and replaces this row via `collection.utils.writeInsert`.
      const tx = productCollection.insert({
        id: crypto.randomUUID(),
        organizationId: organizationId,
        name: value.name,
        slug: slugify(value.name),
        barcode: value.barcode,
        sku: value.sku ?? null,
        categoryId: value.categoryId ?? null,
        pricePurchase: value.pricePurchase,
        priceWholesale: value.priceWholesale,
        priceRetail: value.priceRetail,
        description: null,
        imageUrl: null,
        minimumStock: 0,
        allowNegativeStock: false,
        stockQuantity: 0,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        deletedAt: null,
      });

      await tx.isPersisted.promise;
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(CREATE_PRODUCT_TOASTS.loading);
    },
    onSuccess: () => {
      toast.success(CREATE_PRODUCT_TOASTS.success, {
        id: toastIdRef.current,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(CREATE_PRODUCT_TOASTS.error, { id: toastIdRef.current });
      onError?.(error);
    },
  });

  return formOptions({
    defaultValues: {
      name: "",
      barcode: "",
      sku: "",
      pricePurchase: "",
      priceWholesale: "",
      priceRetail: "",
      categoryId: "",
    },
    validators: {
      onChange: productFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      insertProductMutation.mutate(value, {
        onSuccess: () => {
          formApi.reset();
        },
      });
    },
  });
}