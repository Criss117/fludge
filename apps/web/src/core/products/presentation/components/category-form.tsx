import { createContext, use, useId } from "react";
import {
  type FormType,
  useCategoryForm as useForm,
} from "@repo/ui/products/hooks/use.category-form";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";
import { Button } from "@/core/shared/components/ui/button";
import { useMutateCategories } from "@/core/products/application/hooks/use.mutate-categories";
import type { CreateCategoryDto } from "@repo/ui/products/dtos/create-category.dto";

interface Context {
  form: FormType;
  formId: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  defaultValues?: CreateCategoryDto;
}

interface RootProps {
  children: React.ReactNode;
  businessId: string;
  type?: "category" | "subcategory";
  parentId?: string;
  defaultValues?: CreateCategoryDto;
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

function Root({
  children,
  businessId,
  actions,
  type = "category",
  parentId,
  defaultValues,
}: RootProps) {
  if (!defaultValues && type === "subcategory" && !parentId) {
    throw new Error("parentId is required");
  }

  const form = useForm({ defaultValues });
  const formId = `category-form-${useId()}`;
  const { create } = useMutateCategories();

  const onSubmit = form.handleSubmit((data) => {
    create.mutate(
      {
        ...data,
        businessId,
        parentId,
      },
      {
        onSuccess: actions?.onSuccess,
        onError: (err) => {
          actions?.onError?.();

          form.setError("root", {
            message: err.message,
          });
        },
      }
    );
  });

  return (
    <CategoryFormContext.Provider
      value={{
        form,
        formId,
        onSubmit,
        isPending: create.isPending,
        defaultValues,
      }}
    >
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
    <div className="py-2">
      <p className="text-red-400 text-md">
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
      required
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
  const { formId, isPending, defaultValues } = useCategoryForm();

  return (
    <Button type="submit" form={formId} disabled={isPending}>
      {defaultValues ? "Actualizar Categoría" : "Crear Categoría"}
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
