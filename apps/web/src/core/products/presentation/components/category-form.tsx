import { createContext, use, useId } from "react";
import {
  type FormType,
  useCreateCategoryForm,
} from "@repo/ui/products/hooks/use.create-category-form";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";
import { Button } from "@/core/shared/components/ui/button";
import { useMutateCategories } from "@/core/products/application/hooks/use.mutate-categories";

interface Context {
  form: FormType;
  formId: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

interface RootProps {
  children: React.ReactNode;
  businessId: string;
  actions?: {
    onSuccess?: () => void;
    onError?: () => void;
  };
}

interface ContentProps {
  children: React.ReactNode;
}

const CategoryFormContext = createContext<Context | null>(null);

function useCategoryForm() {
  const context = use(CategoryFormContext);

  if (!context) {
    throw new Error(
      "CategoryFormContext must be used within a CategoryFormProvider"
    );
  }

  return context;
}

function Root({ children, businessId, actions }: RootProps) {
  const form = useCreateCategoryForm();
  const formId = `category-form-${useId()}`;
  const { create } = useMutateCategories();

  const onSubmit = form.handleSubmit((data) => {
    console.log({ data });

    create.mutate(
      {
        ...data,
        businessId,
      },
      {
        onSuccess: actions?.onSuccess,
        onError: actions?.onError,
      }
    );
  });

  return (
    <CategoryFormContext.Provider value={{ form, formId, onSubmit }}>
      {children}
    </CategoryFormContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  const { form, formId, onSubmit } = useCategoryForm();
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} id={formId}>
        {children}
      </form>
    </Form>
  );
}

function RootErrorMessage() {
  const { form } = useCategoryForm();

  if (!form.formState.errors.root) return null;

  return (
    <div>
      <p className="text-error-foreground text-sm font-medium">
        {form.formState.errors.root.message}
      </p>
    </div>
  );
}

function Name() {
  const { form } = useCategoryForm();

  return (
    <InputForm
      label="Nombre"
      name="name"
      placeholder="Nombre de la categoría"
      control={form.control}
    />
  );
}

function Description() {
  const { form } = useCategoryForm();

  return (
    <TextAreaForm
      label="Descripción"
      name="description"
      placeholder="Descripción de la categoría"
      textAreaClassName="resize-none"
      control={form.control}
    />
  );
}

function Submit() {
  const { formId } = useCategoryForm();

  return (
    <Button type="submit" form={formId}>
      Crear Categoría
    </Button>
  );
}

export const CategoryForm = {
  useCategoryForm,
  Root,
  Name,
  Description,
  Submit,
  Content,
  RootErrorMessage,
};
