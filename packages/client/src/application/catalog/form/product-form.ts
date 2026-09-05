import { createProductValidator } from "@fludge/utils/validators/product.validators";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export type CreateProductSchema = z.infer<typeof createProductValidator>;

export type OnProductSubmit = {
  onSubmit: (options: {
    value: CreateProductSchema;
    resetForm: () => void;
  }) => void;
};

const createProductFormDefaultValues: CreateProductSchema = {
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
};

export function createProductFormOptions(options: OnProductSubmit) {
  return formOptions({
    defaultValues: createProductFormDefaultValues,
    validators: {
      onChange: createProductValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
