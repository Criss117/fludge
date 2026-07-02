import { useId } from "react";

import {
  createResourceFormContext,
  useResourceFormState,
} from "@fludge/client/presentation/shared/context/resourse-form.context";
import { Button } from "@fludge/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@fludge/ui/components/sheet";
import { Separator } from "@fludge/ui/components/separator";
import { useCategoryForm } from "@fludge/client/presentation/catalog/forms/category/web";
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import {
  type CategoryFormDefaultValues,
  useUpdateCategoryFormOptions,
} from "@fludge/client/application/catalog/forms/category.form";

const { Context: CategoryFormContext, useResourceForm } =
  createResourceFormContext<CategoryFormDefaultValues>();

export const useUpdateCategoryForm = useResourceForm;

export function UpdateCategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const formState = useResourceFormState<CategoryFormDefaultValues>();

  return (
    <CategoryFormContext.Provider value={formState}>
      {children}
    </CategoryFormContext.Provider>
  );
}

interface Props {
  organizationId: string;
}

export function UpdateCategory({ organizationId }: Props) {
  const { close, data, isOpen } = useUpdateCategoryForm();
  const updateCategoryFormOptions = useUpdateCategoryFormOptions({
    organizationId,
    defaultValues: {
      categoryId: data?.categoryId ?? "",
      name: data?.name ?? "",
      parentId: data?.parentId ?? "",
    },
    onSuccess: () => close(),
  });
  const form = useCategoryForm(updateCategoryFormOptions);

  const formId = `update-category-form-${useId()}`;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          close();
        }
      }}
    >
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Editar Categoría</SheetTitle>
          <SheetDescription>
            Edita los datos de la categoría seleccionada.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 no-scrollbar overflow-y-auto space-y-8">
          <form
            id={formId}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldLegend>Información de la Categoría</FieldLegend>
              <FieldGroup>
                <form.AppField name="name">
                  {(field) => <field.NameField />}
                </form.AppField>
                <form.AppField name="parentId">
                  {(field) => (
                    <field.ParentIdField
                      organizationId={organizationId}
                      excludeId={data?.categoryId}
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Guardar Cambios
          </Button>
          <SheetClose
            render={(props) => (
              <Button
                {...props}
                onClick={(e) => {
                  props.onClick?.(e);
                  form.reset();
                }}
                variant="outline"
              />
            )}
          >
            <span>Cancelar</span>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}