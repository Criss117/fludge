import {
  productFormOptions,
  type OnProductSubmit,
  type ProductFormSchema,
} from "@fludge/client/application/catalog/form/product-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

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

type Presentation = ProductFormSchema["presentations"][number];

interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
  add(presentation: Presentation): void;
  remove(id: string): void;
  markAsDeleted(id: string): void;
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
        id: crypto.randomUUID(),
      },
    ]);
  }

  function remove(id: string) {
    field.setValue((prev) => prev.filter((p) => p.id !== id));
  }

  function markAsDeleted(id: string) {
    field.setValue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)),
    );
  }

  function restore(id: string) {
    field.setValue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p)),
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
    markAsDeleted,
  });
}
