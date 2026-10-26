import type { ProductSummary } from "@fludge/client/catalog/domain/entities";

type Action =
  | {
      type: "create";
    }
  | {
      type: "update";
      product: ProductSummary;
    };

export interface ProductFormScreenProps {
  action: Action;
}
