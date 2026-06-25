import { Suspense } from "react";
import {
  Field,
  FieldDescription,
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
import {
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form";

import { useFindAllCategories } from "@fludge/client/application/catalog/hooks/use-find-categories";
import { slugify } from "@fludge/utils/slugify";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

function NameField() {
  const field = useFieldContext<string>();
  const id = "category-form-name";
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Nombre de la Categoría</FieldLabel>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="EJ: Bebidas"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

/**
 * Read-only preview. The server generates the canonical slug from
 * `name`, so the form never owns a `slug` field — this component
 * only reflects `slugify(name)` so the user can see what to expect.
 */
function SlugField() {
  const form = useFormContext();

  return (
    <Field>
      <FieldLabel htmlFor="category-form-slug-preview">
        Slug (auto-generado)
      </FieldLabel>
      <form.Subscribe selector={(s) => s.values.name}>
        {(name) => (
          <Input
            id="category-form-slug-preview"
            readOnly
            tabIndex={-1}
            value={name ? slugify(name) : ""}
            placeholder="—"
            aria-describedby="category-form-slug-preview-help"
          />
        )}
      </form.Subscribe>
      <FieldDescription id="category-form-slug-preview-help">
        El slug se genera automáticamente a partir del nombre.
      </FieldDescription>
    </Field>
  );
}

function ParentIdField({ organizationId }: { organizationId: string }) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="category-form-parent-id">
        Categoría Padre (Opcional)
      </FieldLabel>
      <Suspense fallback={<Skeleton className="h-8 w-full" />}>
        <ParentOptions
          organizationId={organizationId}
          value={field.state.value}
          onValueChange={(v) => field.handleChange(v ?? "")}
        />
      </Suspense>
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

/**
 * Pulls active categories for the parent dropdown. Wrapped in a
 * local `Suspense` so a slow first read never collapses the whole
 * `CategoriesScreen` skeleton while the `Sheet` is open.
 */
function ParentOptions({
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
    { value: "", label: "Sin categoría padre" },
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
    ParentIdField,
  },
  formComponents: {
    SlugField,
  },
});

export const useCategoryForm = useAppForm;