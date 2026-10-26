import { useProductPresentationForm } from "@fludge/client/catalog/forms/product-presentation.form";
import { useEffect, useState } from "react";

import type {
  CreateProductPresentationFormProps,
  UpdateProductPresentationFormProps,
} from "./types";

export function useCreateProductPresentationForm(props: CreateProductPresentationFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      props.onSubmit(value);
      resetForm();
      close();
    },
  });

  const open = () => setIsOpen(true);
  const close = () => {
    form.reset();
    setIsOpen(false);
  };

  return {
    state: {
      form,
      isOpen,
    },
    actions: {
      open,
      close,
      submit: form.handleSubmit,
    },
  };
}

export function useUpdateProductPresentationForm(props: UpdateProductPresentationFormProps) {
  const form = useProductPresentationForm({
    onSubmit: ({ value, resetForm }) => {
      if (props.selectedPresentation === null) return;

      props.onSubmit({
        ...value,
        id: props.selectedPresentation.id,
      });
      resetForm();
      close();
    },
  });

  useEffect(() => {
    if (props.selectedPresentation === null) return;

    form.reset({
      name: props.selectedPresentation.name,
      barcode: props.selectedPresentation.barcode,
      conversionFactor: props.selectedPresentation.conversionFactor,
      priceSale: props.selectedPresentation.priceSale,
      pricePurchase: props.selectedPresentation.pricePurchase,
      priceWholesale: props.selectedPresentation.priceWholesale,
      status: props.selectedPresentation.status,
    });
  }, [form, props.selectedPresentation]);

  const close = () => {
    props.close();
    form.reset();
  };

  return {
    state: {
      form,
      selectedPresentation: props.selectedPresentation,
    },
    actions: {
      submit: form.handleSubmit,
      close: close,
    },
  };
}
