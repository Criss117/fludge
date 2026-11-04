import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";

type Action =
  | {
      type: "create";
    }
  | {
      type: "update";
      customer: CustomerSummary;
    };

export interface CustomerFormScreenProps {
  action: Action;
}
