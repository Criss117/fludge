import { Suspense } from "react";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@fludge/ui/components/field";
import { Input } from "@fludge/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fludge/ui/components/select";
import { Skeleton } from "@fludge/ui/components/skeleton";
import { Switch } from "@fludge/ui/components/switch";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { useFindAllCategories } from "@fludge/client/application/catalog/hooks/use-find-categories";

const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

function NameField() {
  const field = useFieldContext<string>();
  const id = "product-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre del Producto</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Gaseosa Cola 1.5L"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function BarcodeField() {
  const field = useFieldContext<string>();
  const id = "product-form-barcode";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Código de Barras</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: 7791234567890"
        inputMode="numeric"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function SkuField() {
  const field = useFieldContext<string>();
  const id = "product-form-sku";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>SKU (Opcional)</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: GASE-001"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PriceField({
  label,
  id,
  placeholder,
}: {
  label: string;
  id: string;
  placeholder: string;
}) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        inputMode="decimal"
        placeholder={placeholder}
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function PricePurchaseField() {
  return (
    <PriceField
      label="Precio de Compra"
      id="product-form-price-purchase"
      placeholder="EJ: 10.00"
    />
  );
}

function PriceWholesaleField() {
  return (
    <PriceField
      label="Precio Mayorista"
      id="product-form-price-wholesale"
      placeholder="EJ: 8.50"
    />
  );
}

function PriceRetailField() {
  return (
    <PriceField
      label="Precio de Venta"
      id="product-form-price-retail"
      placeholder="EJ: 15.00"
    />
  );
}

function StockNumberField({
  label,
  id,
  placeholder,
}: {
  label: string;
  id: string;
  placeholder: string;
}) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={field.name}
        type="number"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        inputMode="numeric"
        placeholder={placeholder}
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function StockQuantityField() {
  return (
    <StockNumberField
      label="Cantidad de Stock"
      id="product-form-stock-quantity"
      placeholder="EJ: 0"
    />
  );
}

function MinimumStockField() {
  return (
    <StockNumberField
      label="Stock Mínimo"
      id="product-form-minimum-stock"
      placeholder="EJ: 0"
    />
  );
}

function AllowNegativeStockField() {
  const field = useFieldContext<boolean>();
  const id = "product-form-allow-negative-stock";

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>Permitir stock negativo</FieldLabel>
      <Switch
        id={id}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
    </Field>
  );
}

function CategoryIdField({ organizationId }: { organizationId: string }) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="product-form-category-id">
        Categoría (Opcional)
      </FieldLabel>
      <Suspense fallback={<Skeleton className="h-8 w-full" />}>
        <CategoryOptions
          organizationId={organizationId}
          value={field.state.value}
          onValueChange={(v) => field.handleChange(v ?? "")}
        />
      </Suspense>
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function CategoryOptions({
  organizationId,
  value,
  onValueChange,
}: {
  organizationId: string;
  value: string;
  onValueChange: (v: string | null) => void;
}) {
  const { data: categories } = useFindAllCategories(organizationId);

  const options = [
    { value: "", label: "Sin categoría" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onValueChange((v as string | null) ?? "")}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    NameField,
    BarcodeField,
    SkuField,
    PricePurchaseField,
    PriceWholesaleField,
    PriceRetailField,
    StockQuantityField,
    MinimumStockField,
    AllowNegativeStockField,
    CategoryIdField,
  },
  formComponents: {},
});

export const useProductForm = useAppForm;