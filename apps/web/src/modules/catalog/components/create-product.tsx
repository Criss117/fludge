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
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import { useProductForm } from "@fludge/client/presentation/catalog/forms/product/web";
import { useCreateProductFormOptions } from "@fludge/client/application/catalog/forms/product.form";

interface Props {
  organizationId: string;
}

export function CreateProduct({ organizationId }: Props) {
  const [open, setOpen] = useState(false);
  const createProductFormOptions = useCreateProductFormOptions({
    organizationId,
    onSuccess: () => setOpen(false),
  });
  const form = useProductForm(createProductFormOptions);

  const formId = `create-product-form-${useId()}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={(props) => <Button {...props} />}>
        <PlusIcon />
        <span>Nuevo Producto</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Crear Nuevo Producto</SheetTitle>
          <SheetDescription>
            Crea un producto para el catálogo de la organización.
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
              <FieldLegend>Información del Producto</FieldLegend>
              <FieldGroup>
                <form.AppField name="name">
                  {(field) => <field.NameField />}
                </form.AppField>
                <form.AppField name="barcode">
                  {(field) => <field.BarcodeField />}
                </form.AppField>
                <form.AppField name="sku">
                  {(field) => <field.SkuField />}
                </form.AppField>
                <form.AppForm>
                  <form.SlugPreviewField />
                </form.AppForm>
                <form.AppField name="pricePurchase">
                  {(field) => <field.PricePurchaseField />}
                </form.AppField>
                <form.AppField name="priceWholesale">
                  {(field) => <field.PriceWholesaleField />}
                </form.AppField>
                <form.AppField name="priceRetail">
                  {(field) => <field.PriceRetailField />}
                </form.AppField>
                <form.AppField name="categoryId">
                  {(field) => (
                    <field.CategoryIdField organizationId={organizationId} />
                  )}
                </form.AppField>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <SheetFooter>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" form={formId} disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Producto"}
              </Button>
            )}
          </form.Subscribe>
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