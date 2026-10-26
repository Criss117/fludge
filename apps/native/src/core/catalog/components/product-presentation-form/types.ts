import type { ProductFormSchema } from "@fludge/client/catalog/forms/product.form";
import type {
  ProductPresentationFormSchema,
  useProductPresentationForm,
} from "@fludge/client/catalog/forms/product-presentation.form";

export interface CreateProductPresentationFormProps {
  onSubmit: (value: ProductPresentationFormSchema) => void;
}

export interface UpdateProductPresentationFormProps {
  onSubmit: (value: ProductFormSchema["presentations"][number]) => void;
  close: () => void;
  selectedPresentation: ProductFormSchema["presentations"][number] | null;
}

export interface ProductPresentationFormContentProps {
  isOpen: boolean;
  form: ReturnType<typeof useProductPresentationForm>;
  close: () => void;
}
