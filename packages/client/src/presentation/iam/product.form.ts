import {
  createProductFormOptions,
  type CreateProductSchema,
  type OnProductSubmit,
} from "@fludge/client/application/catalog/form/product-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { Presentations },
  formComponents: {},
});

export function useCreateProductForm(options: OnProductSubmit) {
  return useAppForm(createProductFormOptions(options));
}

type Presentation = CreateProductSchema["presentations"][number];
interface ChildrenProps<T> {
  field: ReturnType<typeof useFieldContext<T>>;
  add(presentation: Presentation): void;
  remove(id: string): void;
  update(id: string, presentation: Presentation): void;
  get(id: string): Presentation | undefined;
}

interface PresentationsChildrenProps {
  children: (props: ChildrenProps<Presentation[]>) => React.ReactNode;
}

function Presentations({ children }: PresentationsChildrenProps) {
  const field = useFieldContext<Presentation[]>();

  function add(presentation: Omit<Presentation, "id">) {
    field.handleChange((prev) => [
      ...prev,
      {
        ...presentation,
        id: crypto.randomUUID(),
      },
    ]);
  }

  function remove(id: string) {
    field.handleChange((prev) => prev.filter((p) => p.id !== id));
  }

  function update(id: string, presentation: Presentation) {
    field.handleChange((prev) =>
      prev.map((p) => (p.id === id ? presentation : p)),
    );
  }

  function get(id: string) {
    return field.state.value.find((p) => p.id === id);
  }

  return children({
    field,
    add,
    remove,
    update,
    get,
  });
}
