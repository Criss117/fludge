import { createContext, use, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createCategorySchema,
  type CreateCategorySchema,
} from "@fludge/utils/validators/categories.validators";

import { FieldGroup } from "@shared/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";

import { useCategoryForm } from "./category-form";
import type { Category } from "@inventory/application/collections/categories.collection";
import { useMutateCategories } from "@inventory/application/hooks/use-mutate-categories";

interface RootProps {
  children: React.ReactNode;
}

interface Context {
  category: Category | null;
  selectCategory: (category: Category) => void;
  clearState: () => void;
}

export const UpdateCategoryContext = createContext<Context | null>(null);

function useUpdateCategory() {
  const context = use(UpdateCategoryContext);

  if (!context)
    throw new Error(
      "useUpdateCategory must be used within an UpdateCategoryProvider",
    );

  return context;
}

function Root({ children }: RootProps) {
  const [category, setCategory] = useState<Category | null>(null);

  const selectCategory = (category: Category) => {
    console.log(category);

    setCategory(category);
  };

  const clearState = () => {
    setCategory(null);
  };

  return (
    <UpdateCategoryContext.Provider
      value={{
        category,
        selectCategory,
        clearState,
      }}
    >
      {children}
    </UpdateCategoryContext.Provider>
  );
}

function Content() {
  const { category, clearState } = useUpdateCategory();
  const formId = `create-category-form-${useId()}`;
  const { update } = useMutateCategories();

  const defaultValues: CreateCategorySchema = {
    name: category?.name ?? "",
    description: category?.description ?? "",
  };

  const form = useCategoryForm({
    defaultValues,
    validators: {
      onChange: createCategorySchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (!category) return;

      const toastLoadingId = toast.loading("Actualizando categoria...", {
        position: "top-center",
      });

      update.mutate(
        {
          ...value,
          id: category.id,
        },
        {
          onSettled: () => toast.dismiss(toastLoadingId),
          onError: (err) =>
            toast.error(err.message, {
              position: "top-center",
            }),
          onSuccess: () => {
            toast.success("Categoria actualizada exitosamente!", {
              position: "top-center",
            });
            formApi.reset();
            clearState();
          },
        },
      );
    },
  });

  return (
    <Dialog
      open={!!category}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          clearState();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Categoria</DialogTitle>
          <DialogDescription>
            Llena los campos para actualiar la categoria
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name="name"
              children={(field) => <field.NameField />}
            />
            <form.AppField
              name="description"
              children={(field) => <field.DescriptionField />}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form={formId} disabled={update.isPending}>
            Actualizar Categoria
          </Button>
          <DialogClose
            render={(props) => <Button {...props} variant="outline" />}
          >
            Cancelar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const UpdateCategory = {
  useUpdateCategory,
  Root,
  Content,
};
