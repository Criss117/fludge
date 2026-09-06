import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";
import {
  barcodeSchema,
  createProductPresentationValidator,
  createProductValidator,
  productStatusSchema,
  updateProductValidator,
} from "@fludge/utils/validators/product.validators";
import { uuidSchema } from "@fludge/utils/validators/shared";
import { formOptions, useForm } from "@tanstack/react-form";
import { z } from "zod";

export const createProductPresentationSchema =
  createProductPresentationValidator
    .omit({
      barcode: true,
      pricePurchase: true,
      priceWholesale: true,
    })
    .extend({
      barcode: barcodeSchema
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
      pricePurchase: z
        .number()
        .or(z.literal(0))
        .transform((v) => (v === 0 ? undefined : v)),
      priceWholesale: z
        .number()
        .or(z.literal(0))
        .transform((v) => (v === 0 ? undefined : v)),
    });

export const updateProductPresentationSchema =
  createProductPresentationSchema.extend({
    id: uuidSchema,
    delete: z.boolean().optional(),
    status: productStatusSchema,
  });

export type CreateProductPresentationSchema = z.input<
  typeof createProductPresentationSchema
>;
export type UpdateProductPresentationSchema = z.input<
  typeof updateProductPresentationSchema
>;

export const createProductSchema = createProductValidator
  .omit({
    categoryId: true,
    presentations: true,
  })
  .extend({
    categoryId: uuidSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    presentations: z
      .array(
        createProductPresentationSchema.extend({
          id: uuidSchema,
        }),
      )
      .min(1, {
        message: getI18nKey("validators.array.at_least_one"),
      }),
  });

export const updateProductSchema = createProductSchema
  .omit({
    presentations: true,
  })
  .extend({
    id: uuidSchema,
    presentations: z.array(updateProductPresentationSchema).min(1, {
      message: getI18nKey("validators.array.at_least_one"),
    }),
  });

export type CreateProductSchema = z.input<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductValidator>;

export type OnProductSubmit = {
  onSubmit: (options: {
    value: CreateProductSchema;
    resetForm: () => void;
  }) => void;
};

export type OnProductPresentationSubmit = {
  onSubmit: (options: {
    value: CreateProductPresentationSchema;
    resetForm: () => void;
  }) => void;
};

export function createProductFormOptions(options: OnProductSubmit) {
  return formOptions({
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      stock: 0,
      allowNegativeStock: false,
      minStock: 0,
      presentations: [] as CreateProductSchema["presentations"],
    },
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function createProductPresentationFormOptions(
  options: OnProductPresentationSubmit,
) {
  return formOptions({
    defaultValues: {
      name: "",
      barcode: "",
      conversionFactor: 1,
      priceSale: 0,
      pricePurchase: 0,
      priceWholesale: 0,
    },
    validators: {
      onChange: createProductPresentationSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useCreateProductPresentationForm(
  options: OnProductPresentationSubmit,
) {
  return useForm(createProductPresentationFormOptions(options));
}
