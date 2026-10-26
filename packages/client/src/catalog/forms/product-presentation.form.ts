import { updateProductPresentationValidator } from "@fludge/utils/validators/product.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import type { z } from "zod";

const productPresentationFormSchema = updateProductPresentationValidator.omit({
  id: true,
});

export type ProductPresentationFormSchema = z.input<typeof productPresentationFormSchema>;

export interface OnProductPresentationSubmit {
  onSubmit: (options: { value: ProductPresentationFormSchema; resetForm: () => void }) => void;
}

const defaultProductPresentationValues: ProductPresentationFormSchema = {
  name: "",
  barcode: "",
  conversionFactor: 1,
  priceSale: 0,
  pricePurchase: 0,
  priceWholesale: 0,
  status: "active",
};

export function productPresentationFormOptions(
  options: OnProductPresentationSubmit,
  initialValues?: ProductPresentationFormSchema,
) {
  return formOptions({
    defaultValues: initialValues ?? defaultProductPresentationValues,
    validators: {
      onSubmit: productPresentationFormSchema,
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
