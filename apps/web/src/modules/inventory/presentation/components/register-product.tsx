import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/modules/shared/components/ui/sheet";
import { useProductForm } from "./product-form";
import {
  createProductSchema,
  type CreateProductSchema,
} from "@fludge/utils/validators/products.schemas";
import { Button } from "@/modules/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/modules/shared/components/ui/field";
import { useId, useState } from "react";

const defaultValues: CreateProductSchema = {
  name: "",
  description: "",
  reorderLevel: 0,
  costPrice: 0,
  wholesalePrice: 0,
  salePrice: 0,
  stock: 0,
  sku: "",
};

export function RegisterProduct() {
  const [open, setOpen] = useState(false);
  const formId = `register-product-form-${useId()}`;
  const form = useProductForm({
    defaultValues,
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
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

        <div className="no-scrollbar overflow-y-auto px-4">
          <form
            id={formId}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldLabel>Datos Basicos</FieldLabel>
              <FieldGroup>
                <form.AppField
                  name="name"
                  children={(field) => <field.NameField />}
                />
                <form.AppField
                  name="sku"
                  children={(field) => <field.SkuField />}
                />
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLabel>Precios y Costos</FieldLabel>
              <FieldGroup>
                <form.AppField
                  name="costPrice"
                  children={(field) => <field.CostPriceField />}
                />
                <form.AppField
                  name="wholesalePrice"
                  children={(field) => <field.WholesalePriceField />}
                />
                <form.AppField
                  name="salePrice"
                  children={(field) => <field.SalePriceField />}
                />
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLabel>Existencias</FieldLabel>
              <FieldGroup>
                <form.AppField
                  name="stock"
                  children={(field) => <field.StockField />}
                />
                <form.AppField
                  name="reorderLevel"
                  children={(field) => <field.ReorderLevelField />}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <SheetFooter>
          <Button type="submit" form={formId}>
            Save changes
          </Button>
          <SheetClose render={<Button variant="outline">Cancel</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
