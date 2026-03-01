import { useId, useState } from "react";
import { BadgeCheck, Banknote, ClipboardCheck, PlusIcon } from "lucide-react";
import { createProductSchema } from "@fludge/utils/validators/products.schemas";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/sheet";
import { Button } from "@shared/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@shared/components/ui/field";

import { useProductForm } from "./product-form";
import { useMutateProducts } from "@inventory/application/hooks/use-mutate-products";

const defaultValues = {
  name: "",
  sku: "",
  description: "",
  minStock: 0,
  stock: 0,
  costPrice: 0,
  wholesalePrice: 0,
  salePrice: 0,
};

export function RegisterProduct() {
  const [open, setOpen] = useState(false);
  const { create } = useMutateProducts();
  const formId = `register-product-form-${useId()}`;
  const form = useProductForm({
    defaultValues,
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: ({ value }) => {
      create.mutate(value, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        setOpen(v);
      }}
    >
      <SheetTrigger render={(props) => <Button {...props} />}>
        <PlusIcon />
        Registrar un producto
      </SheetTrigger>
      <SheetContent className="data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Registrar un nuevo Producto</SheetTitle>
          <SheetDescription>
            Completa los campos para registrar un nuevo producto.
          </SheetDescription>
        </SheetHeader>

        <div className="no-scrollbar overflow-y-auto px-4 pb-20">
          <form
            id={formId}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldSet className="gap-y-2">
              <FieldLegend className="flex items-center gap-x-1.5">
                <BadgeCheck />
                Datos Basicos
              </FieldLegend>
              <FieldGroup>
                <form.AppField
                  name="name"
                  children={(field) => <field.NameField />}
                />
                <form.AppField
                  name="sku"
                  children={(field) => <field.SkuField />}
                />
                <form.AppField
                  name="description"
                  children={(field) => <field.DescriptionField />}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSet className="gap-y-2">
              <FieldLegend className="flex items-center gap-x-1.5">
                <Banknote />
                Precios y Costos
              </FieldLegend>
              <FieldGroup className="grid grid-cols-2">
                <form.AppField
                  name="costPrice"
                  children={(field) => <field.CostPriceField />}
                />
                <form.AppField
                  name="wholesalePrice"
                  children={(field) => <field.WholesalePriceField />}
                />
                <div className="col-span-2">
                  <form.AppField
                    name="salePrice"
                    children={(field) => <field.SalePriceField />}
                  />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet className="gap-y-2">
              <FieldLegend className="flex items-center gap-x-1.5">
                <ClipboardCheck />
                Existencias
              </FieldLegend>
              <FieldGroup className="grid grid-cols-2">
                <form.AppField
                  name="stock"
                  children={(field) => <field.StockField />}
                />
                <form.AppField
                  name="minStock"
                  children={(field) => <field.MinStockField />}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Registrar Producto
          </Button>
          <SheetClose render={<Button variant="outline">Cancelar</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
