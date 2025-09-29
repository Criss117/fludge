import { createContext, use, useId } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  useProductForm as useForm,
  type FormType,
} from "@repo/ui/products/hooks/use.product-form";
import type { ProductFormDto } from "@repo/ui/products/dtos/product-form.dto";
import { Form } from "@/core/shared/components/ui/form";
import { InputForm } from "@/core/shared/components/form/input-form";
import { SwitchForm } from "@/core/shared/components/form/switch-form";
import { Button } from "@/core/shared/components/ui/button";
import { TextAreaForm } from "@/core/shared/components/form/text-area-form";
import { useMutateProducts } from "@/core/products/application/hooks/use.mutate-products";
import type { CategorySummary } from "@repo/core/entities/category";
import { SelectInputForm } from "@/core/shared/components/form/select-input-form";

interface Context {
  form: FormType;
  method?: "create" | "update";
  formId: string;
  businessId: string;
  productId?: string;
}

interface RootProps {
  children: React.ReactNode;
  defaultValues?: ProductFormDto;
  method?: "create" | "update";
  businessId: string;
  productId?: string;
}

interface SelectCategoryProps {
  categories: CategorySummary[];
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

function Root({
  children,
  defaultValues,
  method = "create",
  businessId,
  productId,
}: RootProps) {
  if (method === "update" && !productId) {
    throw new Error("ProductId is required when updating a product");
  }

  const form = useForm({ defaultValues });
  const formId = `product-form-${useId()}`;

  return (
    <ProductFormContext.Provider
      value={{
        form,
        method,
        formId,
        businessId,
        productId,
      }}
    >
      {children}
    </ProductFormContext.Provider>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { create, update } = useMutateProducts();
  const { form, formId, businessId, method, productId } = useProductForm();

  const onSubmit = form.handleSubmit((data) => {
    if (method === "create") {
      create.mutate(
        {
          ...data,
          businessId,
        },
        {
          onSuccess: (_, variables) => {
            form.reset();
            router.navigate({
              to: "/business/$id/products",
              params: {
                id: variables.businessId,
              },
            });
          },
          onError: (err) => {
            form.setError("root", {
              message: err.message,
            });
          },
        }
      );
    }

    if (method === "update" && productId) {
      update.mutate(
        {
          ...data,
          businessId,
          productId,
        },
        {
          onSuccess: (_, variables) => {
            form.reset();
            router.navigate({
              to: "/business/$id/products/$productid",
              params: {
                id: variables.businessId,
                productid: variables.productId,
              },
            });
          },
          onError: (err) => {
            form.setError("root", {
              message: err.message,
            });
          },
        }
      );
    }
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
    <SwitchForm
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
    <Button type="submit" form={formId} disabled={!formId}>
      {method === "create" ? "Crear" : "Actualizar"}
    </Button>
  );
}

function SelectCategory({ categories }: SelectCategoryProps) {
  const { form } = useProductForm();

  return (
    <SelectInputForm
      label="Categoría"
      name="categoryId"
      control={form.control}
      items={categories.map((category) => ({
        value: category.id,
        label: category.name,
      }))}
    />
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
  SelectCategory,
};
