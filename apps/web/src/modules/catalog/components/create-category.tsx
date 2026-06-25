import { useId, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@fludge/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fludge/ui/components/sheet";
import { Separator } from "@fludge/ui/components/separator";
import { useCategoryForm } from "@fludge/client/presentation/catalog/forms/category/web";
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import { useCreateCategoryFormOptions } from "@fludge/client/application/catalog/forms/category.form";

interface Props {
  organizationId: string;
}

export function CreateCategory({ organizationId }: Props) {
  const [open, setOpen] = useState(false);
  const createCategoryFormOptions = useCreateCategoryFormOptions({
    organizationId,
    onSuccess: () => setOpen(false),
  });
  const form = useCategoryForm(createCategoryFormOptions);

  const formId = `create-category-form-${useId()}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={(props) => <Button {...props} />}>
        <PlusIcon />
        <span>Nueva Categoría</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Crear Nueva Categoría</SheetTitle>
          <SheetDescription>
            Crea una categoría para organizar los productos de la
            organización.
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
                <form.SlugField />
                <form.AppField name="parentId">
                  {(field) => (
                    <field.ParentIdField organizationId={organizationId} />
                  )}
                </form.AppField>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Crear Categoría
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