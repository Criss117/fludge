import { createContext, use, useId } from "react";
import {
  useProductForm as useForm,
  type FormType,
} from "@repo/ui/products/hooks/use.product-form";
import type { ProductFormDto } from "@repo/ui/products/dtos/product-form.dto";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { SelectForm } from "@/core/shared/components/form/select-form";
import { Button } from "@/core/shared/components/ui/button";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";

interface Context {
  form: FormType;
  method?: "create" | "update";
  formId: string;
}

interface RootProps {
  children: React.ReactNode;
  defaultValues?: ProductFormDto;
  method?: "create" | "update";
  businessId: string;
}

const ProductFormContext = createContext<Context | null>(null);

function useProductForm() {
  const context = use(ProductFormContext);

  if (!context) {
    throw new Error(
      "ProductFormContext must be used within a ProductFormProvider"
    );
  }

  return context;
}

function Root({ children, defaultValues, method = "create" }: RootProps) {
  const form = useForm({ defaultValues });
  const formId = `product-form-${useId()}`;

  return (
    <ProductFormContext.Provider
      value={{
        form,
        method,
        formId,
      }}
    >
      {children}
    </ProductFormContext.Provider>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const { form, formId } = useProductForm();

  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
  });

  return (
    <Form {...form}>
      <form id={formId} onSubmit={onSubmit}>
        {children}
      </form>
    </Form>
  );
}

function Name() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Nombre del producto"
      name="name"
      control={form.control}
      required
      placeholder="Nombre del producto"
    />
  );
}

function Barcode() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Código de barras"
      name="barcode"
      control={form.control}
      required
      placeholder="Código de barras"
    />
  );
}

function Description() {
  const { form } = useProductForm();

  return (
    <TextAreaForm
      textAreaClassName="resize-none"
      label="Descripción"
      name="description"
      control={form.control}
      placeholder="Descripción"
    />
  );
}

function PurchasePrice() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Precio de compra"
      name="purchasePrice"
      control={form.control}
      type="number"
      required
      placeholder="Precio de compra"
    />
  );
}

function SalePrice() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Precio de venta"
      name="salePrice"
      control={form.control}
      type="number"
      required
      placeholder="Precio de venta"
    />
  );
}

function WholesalePrice() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Precio mayorista"
      name="wholesalePrice"
      control={form.control}
      type="number"
      required
      placeholder="Precio mayorista"
    />
  );
}

function OfferPrice() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Precio de oferta"
      name="offerPrice"
      control={form.control}
      type="number"
      placeholder="Precio de oferta"
    />
  );
}

function MinStock() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Stock mínimo"
      name="minStock"
      control={form.control}
      type="number"
      required
      placeholder="Stock mínimo"
    />
  );
}

function Stock() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Stock"
      name="stock"
      control={form.control}
      type="number"
      required
      placeholder="Stock"
    />
  );
}

function AllowsNegativeInventory() {
  const { form } = useProductForm();

  return (
    <SelectForm
      label="Permitir inventario negativo"
      name="allowsNegativeInventory"
      control={form.control}
      description="Permite que el stock de este producto sea negativo"
    />
  );
}

function Weight() {
  const { form } = useProductForm();

  return (
    <InputForm
      label="Peso"
      name="weight"
      control={form.control}
      type="number"
      placeholder="Peso"
    />
  );
}

function Submit() {
  const { formId, method } = useProductForm();

  return (
    <Button type="submit" className="w-full" form={formId} disabled={!formId}>
      {method === "create" ? "Crear" : "Actualizar"}
    </Button>
  );
}

export const ProductForm = {
  useProductForm,
  Root,
  Content,
  Name,
  Barcode,
  Description,
  PurchasePrice,
  SalePrice,
  WholesalePrice,
  OfferPrice,
  MinStock,
  Stock,
  AllowsNegativeInventory,
  Weight,
  Submit,
};
