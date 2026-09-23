export const historyActionEnum = ["update", "activate", "deactivate"] as const;
export const statusEnum = ["active", "inactive"] as const;
export const roleEnum = ["owner", "member"] as const;
export const productStatusEnum = [
  "active",
  "inactive",
  "discontinued",
] as const;
export const customerDocumentTypeEnum = ["CC", "NIT", "CE"] as const;
export const saleStatusEnum = ["open", "partial", "completed", "cancelled"] as const;
export const paymentTypeEnum = ["cash", "credit"] as const;
export const customerPaymentMethodEnum = ["cash", "transfer"] as const;
export const customerPaymentStatusEnum = ["active", "cancelled"] as const;

export type HistoryActionEnum = (typeof historyActionEnum)[number];
export type StatusEnum = (typeof statusEnum)[number];
export type RoleEnum = (typeof roleEnum)[number];
export type ProductStatusEnum = (typeof productStatusEnum)[number];
export type CustomerDocumentTypeEnum =
  (typeof customerDocumentTypeEnum)[number];
export type SaleStatusEnum = (typeof saleStatusEnum)[number];
export type PaymentTypeEnum = (typeof paymentTypeEnum)[number];
export type CustomerPaymentMethodEnum =
  (typeof customerPaymentMethodEnum)[number];
export type CustomerPaymentStatusEnum =
  (typeof customerPaymentStatusEnum)[number];
