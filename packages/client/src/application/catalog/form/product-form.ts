import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";
import {
  updateProductPresentationValidator,
  updateProductValidator,
} from "@fludge/utils/validators/product.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import { z } from "zod";

const productPresentationFormSchema = updateProductPresentationValidator.extend(
  {
    isDeleted: z.boolean().optional(),
  },
);

const productFormSchema = updateProductValidator
  .omit({
    presentations: true,
    id: true,
  })
  .extend({
    presentations: z.array(productPresentationFormSchema).min(1, {
      message: getI18nKey("validators.array.at_least_one"),
    }),
  })
  .refine((data) => data.presentations.filter((p) => !p.isDeleted).length > 0, {
    path: ["presentations"],
    message: getI18nKey("validators.array.presentations.at_least_one"),
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
  isDeleted: false,
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
