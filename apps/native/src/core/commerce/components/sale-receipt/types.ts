import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productSnapshot: {
    product: { name: string };
    presentation: { name: string };
  } | null;
}

export interface ReceiptData {
  id: string;
  total: number;
  items: ReceiptItem[];
  customer?: Pick<CustomerSummary, "name" | "documentType" | "documentNumber"> | null;

  // Solo existen en una venta ya registrada (SaleSummary)
  saleNumber?: string;
  createdAt?: Date;
  paymentType?: "cash" | "credit";
  status?: "cancelled" | "completed" | "open" | "partial";
  cancelReason?: string | null;

  // Solo existe en un ticket activo (borrador)
  name?: string;
}

export interface SaleReceiptProps {
  receipt: ReceiptData;
}
