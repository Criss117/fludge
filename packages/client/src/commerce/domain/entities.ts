import type { LocalCustomer, LocalSale } from "@fludge/db/local-schemas/shared.schema";

export type CustomerSummary = Omit<LocalCustomer, "payments">;

export type CustomerDetail = LocalCustomer;

export type SaleDetail = LocalSale;