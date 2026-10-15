import {
  updateProductPresentationValidator,
  updateProductValidator,
} from "@fludge/utils/validators/product.validators";
import { getI18nKey } from "@fludge/utils/validators/shared";
import {
  formOptions,
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form";
import { z } from "zod";

const productPresentationFormSchema = updateProductPresentationValidator
  .omit({
    id: true,
  })
  .extend({
    id: z.string(),
  });

const productFormSchema = updateProductValidator
  .omit({
    presentations: true,
    id: true,
  })
  .extend({
    presentations: z.array(productPresentationFormSchema).min(1, {
      message: getI18nKey("validators.array.at_least_one"),
    }),
  });

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

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

type Presentation = ProductFormSchema["presentations"][number];

interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
  add(presentation: Omit<Presentation, "id">): void;
  remove(id: string): void;
  markAsInactive(id: string): void;
  restore(id: string): void;
  update(id: string, presentation: Presentation): void;
  get(id: string): Presentation | undefined;
}

interface PresentationsChildrenProps {
  children: (props: ChildrenProps<Presentation[]>) => React.ReactNode;
}

function Presentations({ children }: PresentationsChildrenProps) {
  const field = useFieldContext<Presentation[]>();

  function add(presentation: Omit<Presentation, "id">) {
    field.setValue((prev) => [
      ...prev,
      {
        ...presentation,
        id: Date.now().toString(),
      },
    ]);
  }

  function remove(id: string) {
    field.setValue((prev) => prev.filter((p) => p.id !== id));
  }

  function markAsInactive(id: string) {
    field.setValue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "inactive" } : p)),
    );
  }

  function restore(id: string) {
    field.setValue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" } : p)),
    );
  }

  function update(id: string, presentation: Presentation) {
    field.setValue((prev) => prev.map((p) => (p.id === id ? presentation : p)));
  }

  function get(id: string) {
    return field.state.value.find((p) => p.id === id);
  }

  return children({
    field,
    add,
    remove,
    restore,
    update,
    get,
    markAsInactive,
  });
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Presentations },
  formComponents: {},
});

export function useProductForm(
  options: OnProductSubmit,
  initialValues?: ProductFormSchema,
) {
  return useAppForm(productFormOptions(options, initialValues));
}
