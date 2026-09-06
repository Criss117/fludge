import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";
import {
  barcodeSchema,
  pricePurchaseSchema,
  priceWholesaleSchema,
  updateProductPresentationValidator,
  updateProductValidator,
} from "@fludge/utils/validators/product.validators";
import { uuidSchema } from "@fludge/utils/validators/shared";
import { formOptions, useForm } from "@tanstack/react-form";
import { z } from "zod";

const productPresentationFormSchema = updateProductPresentationValidator
  .omit({
    barcode: true,
    pricePurchase: true,
    priceWholesale: true,
  })
  .extend({
    barcode: barcodeSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    pricePurchase: pricePurchaseSchema
      .or(z.literal(0))
      .transform((v) => (v === 0 ? undefined : v)),
    priceWholesale: priceWholesaleSchema
      .or(z.literal(0))
      .transform((v) => (v === 0 ? undefined : v)),
  });

const productFormSchema = updateProductValidator
  .omit({
    categoryId: true,
    presentations: true,
  })
  .extend({
    categoryId: uuidSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    presentations: z.array(productPresentationFormSchema).min(1, {
      message: getI18nKey("validators.array.at_least_one"),
    }),
  });

export type ProductPresentationFormSchema = z.input<
  typeof productPresentationFormSchema
>;
export type ProductFormSchema = z.input<typeof productFormSchema>;

export interface OnProductSubmit {
  onSubmit: (options: {
    value: ProductFormSchema;
    resetForm: () => void;
  }) => void;
}

const defaultProductValues: ProductFormSchema = {
  id: crypto.randomUUID(),
  status: "active",
  name: "",
  categoryId: "",
  description: "",
  stock: 0,
  allowNegativeStock: false,
  minStock: 0,
  presentations: [],
};

export function productFormOptions(
  options: OnProductSubmit,
  initialValues?: ProductFormSchema,
) {
  return formOptions({
    defaultValues: initialValues ?? defaultProductValues,
    validators: {
      onChange: productFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export interface OnProductPresentationSubmit {
  onSubmit: (options: {
    value: ProductPresentationFormSchema;
    resetForm: () => void;
  }) => void;
}

const defaultProductPresentationValues: ProductPresentationFormSchema = {
  id: crypto.randomUUID(),
  name: "",
  barcode: "",
  conversionFactor: 1,
  priceSale: 0,
  pricePurchase: 0,
  priceWholesale: 0,
  status: "active",
  delete: false,
};

export function productPresentationFormOptions(
  options: OnProductPresentationSubmit,
  initialValues?: ProductPresentationFormSchema,
) {
  return formOptions({
    defaultValues: initialValues ?? defaultProductPresentationValues,
    validators: {
      onChange: productPresentationFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useProductPresentationForm(
  options: OnProductPresentationSubmit,
  initialValues?: ProductPresentationFormSchema,
) {
  return useForm(productPresentationFormOptions(options, initialValues));
}
