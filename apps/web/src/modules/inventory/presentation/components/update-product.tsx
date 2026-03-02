import { createContext, use, useId, useState } from "react";
import { BadgeCheck, Banknote, ClipboardCheck, PlusIcon } from "lucide-react";
import { createProductSchema } from "@fludge/utils/validators/products.schemas";
import { toast } from "sonner";

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

import { useMutateProducts } from "@inventory/application/hooks/use-mutate-products";
import type { Product } from "@inventory/application/collections/products.collection";
import { useProductForm } from "./product-form";

interface RootProps {
  children: React.ReactNode;
}

interface Context {
  product: Product | null;
  selectProduct: (product: Product) => void;
  clearState: () => void;
}

const UpdateProductContext = createContext<Context | null>(null);

export function useUpdateProduct() {
  const context = use(UpdateProductContext);
  if (!context)
    throw new Error(
      "useUpdateProduct must be used within an UpdateProductProvider",
    );

  return context;
}

export function UpdateProductRoot({ children }: RootProps) {
  const [product, setProduct] = useState<Product | null>(null);

  const clearState = () => {
    setProduct(null);
  };

  return (
    <UpdateProductContext.Provider
      value={{ product, selectProduct: setProduct, clearState }}
    >
      {children}
    </UpdateProductContext.Provider>
  );
}

export function UpdateProductForm() {
  const { product, clearState } = useUpdateProduct();
  const { update } = useMutateProducts();
  const formId = `register-product-form-${useId()}`;

  const form = useProductForm({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      minStock: product?.minStock ?? 0,
      stock: product?.stock ?? 0,
      costPrice: product?.costPrice ?? 0,
      wholesalePrice: product?.wholesalePrice ?? 0,
      salePrice: product?.salePrice ?? 0,
    },
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: ({ value }) => {
      if (!product) return;

      const loadingToastId = toast.loading("Actualizando producto...", {
        position: "top-center",
      });

      update.mutate(
        {
          id: product.id,
          ...value,
        },
        {
          onSuccess: () => {
            toast.success("Producto actualizado exitosamente.", {
              position: "top-center",
            });
            clearState();
          },
          onError: (error) => {
            toast.error(error.message, {
              position: "top-center",
            });
          },
          onSettled: () => {
            toast.dismiss(loadingToastId);
          },
        },
      );
    },
  });

  return (
    <Sheet
      open={!!product}
      onOpenChange={(v) => {
        if (!v) {
          clearState();
          form.reset();
        }
      }}
    >
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
