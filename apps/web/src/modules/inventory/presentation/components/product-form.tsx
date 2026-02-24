import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/modules/shared/components/ui/field";
import { Input } from "@/modules/shared/components/ui/input";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { inputNumberHelper } from "@/modules/shared/lib/utils";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    NameField,
    SkuField,
    DescriptionField,
    CostPriceField,
    WholesalePriceField,
    SalePriceField,
    MinStockField,
    StockField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

function NameField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-name";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Nombre Del Producto
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="text"
        placeholder="Ej: Monitor Gamer 27 pulgadas"
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function SkuField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-sku";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        SKU / Código de barras
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="text"
        placeholder="Ej: AUTO-GEN-001"
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function DescriptionField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-description";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Descripcion del Producto</FieldLabel>
      <Textarea
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        className="resize-none"
        placeholder="Descripción del Producto"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function WholesalePriceField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-wholesale-price";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Precio al por mayor
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="number"
        placeholder="Ej: 200"
        name={field.name}
        value={inputNumberHelper.value(
          field.state.value,
          field.state.meta.isTouched,
        )}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(inputNumberHelper.onChange(e.target.value))
        }
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function SalePriceField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-sale-price";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Precio de venta
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="number"
        placeholder="Ej: 200"
        name={field.name}
        value={inputNumberHelper.value(
          field.state.value,
          field.state.meta.isTouched,
        )}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(inputNumberHelper.onChange(e.target.value))
        }
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function CostPriceField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-cost-price";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Precio de compra
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="number"
        placeholder="Ej: 200"
        name={field.name}
        value={inputNumberHelper.value(
          field.state.value,
          field.state.meta.isTouched,
        )}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(inputNumberHelper.onChange(e.target.value))
        }
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function StockField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-stock";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>
        Stock
        <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id={id}
        type="number"
        placeholder="Ej: 10"
        name={field.name}
        value={inputNumberHelper.value(
          field.state.value,
          field.state.meta.isTouched,
        )}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(inputNumberHelper.onChange(e.target.value))
        }
        aria-invalid={isInvalid}
        required
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function MinStockField() {
  const field = useFieldContext<string>();
  const id = field.name + "-product-reorder-level";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-2" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Stock Minimo</FieldLabel>
      <Input
        id={id}
        type="number"
        placeholder="Ej: 10"
        name={field.name}
        value={inputNumberHelper.value(
          field.state.value,
          field.state.meta.isTouched,
        )}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(inputNumberHelper.onChange(e.target.value))
        }
        aria-invalid={isInvalid}
        required
      />
      <FieldDescription>
        No llenar o colocar 0 para no tener stock minimo y permitir stock
        negativo
      </FieldDescription>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export const useProductForm = useAppForm;
