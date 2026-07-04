import { useId } from "react";

import {
  createResourceFormContext,
  useResourceFormState,
} from "@fludge/client/presentation/shared/context/resourse-form.context";
import { Button } from "@fludge/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
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
import { FieldGroup, FieldLegend, FieldSet } from "@fludge/ui/components/field";
import { useProductForm } from "@fludge/client/presentation/catalog/forms/product/web";
import {
  type ProductFormDefaultValues,
  useUpdateProductFormOptions,
} from "@fludge/client/application/catalog/forms/product.form";

const { Context: ProductFormContext, useResourceForm } =
  createResourceFormContext<ProductFormDefaultValues>();

export const useUpdateProductForm = useResourceForm;

export function UpdateProductProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const formState = useResourceFormState<ProductFormDefaultValues>();

  return (
    <ProductFormContext.Provider value={formState}>
      {children}
    </ProductFormContext.Provider>
  );
}

interface Props {
  organizationId: string;
}

export function UpdateProduct({ organizationId }: Props) {
  const { close, data, isOpen } = useUpdateProductForm();
  const updateProductFormOptions = useUpdateProductFormOptions({
    organizationId,
    defaultValues: data ?? {
      productId: "",
      name: "",
      barcode: "",
      sku: "",
      pricePurchase: "",
      priceWholesale: "",
      priceRetail: "",
      categoryId: "",
      stockQuantity: "",
      minimumStock: "",
      allowNegativeStock: false,
    },
    onSuccess: () => close(),
  });
  const form = useProductForm(updateProductFormOptions);

  const formId = `update-product-form-${useId()}`;

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
          <SheetTitle className="text-xl">Editar Producto</SheetTitle>
          <SheetDescription>
            Edita los datos del producto seleccionado.
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
                <form.AppField name="barcode">
                  {(field) => <field.BarcodeField />}
                </form.AppField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.AppField name="name">
                    {(field) => <field.NameField />}
                  </form.AppField>
                  <form.AppField name="sku">
                    {(field) => <field.SkuField />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <form.AppField name="pricePurchase">
                    {(field) => <field.PricePurchaseField />}
                  </form.AppField>
                  <form.AppField name="priceWholesale">
                    {(field) => <field.PriceWholesaleField />}
                  </form.AppField>
                  <form.AppField name="priceRetail">
                    {(field) => <field.PriceRetailField />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.AppField name="stockQuantity">
                    {(field) => <field.StockQuantityField />}
                  </form.AppField>
                  <form.AppField name="minimumStock">
                    {(field) => <field.MinimumStockField />}
                  </form.AppField>
                </div>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Stock negativo</CardTitle>
                    <CardDescription>
                      Habilitá esta opción para permitir cantidades de stock
                      negativas para este producto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form.AppField name="allowNegativeStock">
                      {(field) => <field.AllowNegativeStockField />}
                    </form.AppField>
                  </CardContent>
                </Card>
                <form.AppField name="categoryId">
                  {(field) => (
                    <field.CategoryIdField
                      organizationId={organizationId}
                    />
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
                Guardar Cambios
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