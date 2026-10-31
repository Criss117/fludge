import type { ProductDetail, ProductSummary } from "@fludge/client/catalog/domain/entities";

export interface ProductPickerProps {
  selectedProduct: ProductSummary | null;
  onAdd: (product: ProductDetail, presentations: ProductDetail["presentations"]) => void;
  onClose: () => void;
}
