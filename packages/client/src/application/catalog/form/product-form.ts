import {
  barcodeSchema,
  createProductPresentationValidator,
  createProductValidator,
  pricePurchaseSchema,
  priceWholesaleSchema,
  productStatusSchema,
} from "@fludge/utils/validators/product.validators";
import { getI18nKey, uuidSchema } from "@fludge/utils/validators/shared";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const createProductPresentationSchema =
  createProductPresentationValidator
    .omit({
      barcode: true,
      priceWholesale: true,
      pricePurchase: true,
    })
    .extend({
      barcode: z
        .literal("")
        .or(barcodeSchema)
        .transform((v) => (v === "" ? undefined : v)),

      priceWholesale: z
        .literal(0)
        .or(priceWholesaleSchema)
        .transform((v) => (v === 0 ? undefined : v)),

      pricePurchase: z
        .literal(0)
        .or(pricePurchaseSchema)
        .transform((v) => (v === 0 ? undefined : v)),
    });

export const updateProductPresentationSchema =
  createProductPresentationSchema.extend({
    id: uuidSchema,
    status: productStatusSchema,
    delete: z.boolean(),
  });

export const createProductSchema = createProductValidator
  .omit({
    categoryId: true,
    presentations: true,
  })
  .extend({
    categoryId: z
      .literal("")
      .or(uuidSchema)
      .transform((v) => (v === "" ? undefined : v)),
    presentations: z.array(createProductPresentationSchema).min(1, {
      error: getI18nKey("validators.array.at_least_one"),
    }),
  });

export const updateProductSchema = createProductSchema
  .omit({
    presentations: true,
  })
  .extend({
    presentationsToUpdate: z.array(updateProductPresentationSchema),
    presentations: z.array(createProductPresentationSchema),
  });

export type CreateProductSchema = z.input<typeof createProductSchema>;
export type CreateProductOutputSchema = z.output<typeof createProductSchema>;

export type UpdateProductSchema = z.input<typeof updateProductSchema>;
export type UpdateProductOutputSchema = z.output<typeof updateProductSchema>;

export type OnProductSubmit = {
  onSubmit: (options: {
    value: CreateProductOutputSchema;
    resetForm: () => void;
  }) => void;
};

export type OnProductUpdateSubmit = {
  onSubmit: (options: {
    value: z.output<typeof updateProductSchema>;
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
      presentations: [
        {
          barcode: "",
          conversionFactor: 1,
          name: "",
          pricePurchase: 0,
          priceSale: 0,
          priceWholesale: 0,
        },
      ],
    },
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function updateProductFormOptions(
  defaultValues: UpdateProductSchema,
  options: OnProductUpdateSubmit,
) {
  return formOptions({
    defaultValues,
    validators: {
      onChange: updateProductSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
