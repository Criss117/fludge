import type { CustomerDetail } from "@fludge/client/commerce/domain/entities";

type Action =
  | {
      type: "create";
    }
  | {
      type: "update";
      customer: CustomerDetail;
    };

export interface CustomerFormScreenProps {
  action: Action;
}
