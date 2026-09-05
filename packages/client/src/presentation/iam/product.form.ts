import {
  type CreateProductSchema,
  type OnProductSubmit,
  createProductFormOptions,
} from "@fludge/client/application/catalog/form/product-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
}

export type PresentationsFieldChildrenProps = ChildrenProps<
  CreateProductSchema["presentations"]
> & {
  addPresentation(): void;
  removePresentation(index: number): void;
  canRemovePresentation: boolean;
};

type PresentationsFieldProps = {
  children: (props: PresentationsFieldChildrenProps) => React.ReactNode;
};

function Presentations({ children }: PresentationsFieldProps) {
  const field = useFieldContext<CreateProductSchema["presentations"]>();

  function addPresentation() {
    field.pushValue({
      barcode: "",
      conversionFactor: 1,
      name: "",
      pricePurchase: 0,
      priceSale: 0,
      priceWholesale: 0,
    });
  }

  function removePresentation(index: number) {
    if (field.state.value.length === 1) return;

    field.removeValue(index);
  }

  const canRemovePresentation = field.state.value.length > 1;

  return children({
    field,
    canRemovePresentation,
    addPresentation,
    removePresentation,
  });
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Presentations },
  formComponents: {},
});

export function useCreateProductForm(options: OnProductSubmit) {
  return useAppForm(createProductFormOptions(options));
}
