import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import { SaleItem } from "@fludge/api/modules/sales/domain/entities/sale-item.entity";
import type { CreateSaleItem } from "@fludge/api/modules/sales/domain/entities/sale-item.entity";
import type { PaymentTypeEnum } from "@fludge/utils/enums/db-enums";
import { UUID } from "@fludge/utils/uuid";

export type BuildSaleOptions = {
  paymentType?: PaymentTypeEnum;
  customerId?: string | null;
  notes?: string | null;
  sequence?: number;
  items?: CreateSaleItem[];
  organizationId?: string;
  createdBy?: string;
};

export const SALE_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const SALE_USER_ID = "00000000-0000-4000-8000-000000000002";
export const SALE_PRODUCT_ID = "00000000-0000-4000-8000-000000000003";
export const SALE_PRESENTATION_ID = "00000000-0000-4000-8000-000000000004";

export function makeCatalogItem(options?: {
  presentationId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  organizationId?: string;
}): CreateSaleItem {
  return {
    organizationId: UUID.fromString(options?.organizationId ?? SALE_ORG_ID),
    productId: UUID.fromString(options?.productId ?? SALE_PRODUCT_ID),
    productPresentationId: UUID.fromString(
      options?.presentationId ?? SALE_PRESENTATION_ID,
    ),
    productSnapshot: {
      product: {
        id: options?.productId ?? SALE_PRODUCT_ID,
        name: "Agua",
        slug: "agua",
      },
      presentation: {
        id: options?.presentationId ?? SALE_PRESENTATION_ID,
        name: "Caja",
        barcode: "7501234567890",
        conversionFactor: 24,
      },
    },
    name: "Agua",
    unitPrice: options?.unitPrice ?? 1000,
    quantity: options?.quantity ?? 2,
  };
}

export function makeAdHocItem(options?: {
  quantity?: number;
  unitPrice?: number;
  organizationId?: string;
}): CreateSaleItem {
  return {
    organizationId: UUID.fromString(options?.organizationId ?? SALE_ORG_ID),
    productId: null,
    productPresentationId: null,
    productSnapshot: null,
    name: "Servicio",
    unitPrice: options?.unitPrice ?? 5000,
    quantity: options?.quantity ?? 1,
  };
}

export function buildSale(options?: BuildSaleOptions) {
  const organizationId = options?.organizationId ?? SALE_ORG_ID;
  const createdBy = options?.createdBy ?? SALE_USER_ID;

  return Sale.create({
    organizationId: UUID.fromString(organizationId),
    createdBy: UUID.fromString(createdBy),
    customerId: options?.customerId
      ? UUID.fromString(options.customerId)
      : null,
    paymentType: options?.paymentType ?? "cash",
    notes: options?.notes ?? null,
    sequence: options?.sequence ?? 1,
    items: options?.items ?? [makeCatalogItem({ organizationId })],
  });
}

export function makeSaleItem(options?: {
  presentationId?: string | null;
  productId?: string | null;
  quantity?: number;
  unitPrice?: number;
  snapshot?: boolean;
  organizationId?: string;
}) {
  return SaleItem.create({
    organizationId: UUID.fromString(options?.organizationId ?? SALE_ORG_ID),
    productId: options?.productId
      ? UUID.fromString(options.productId)
      : options?.productId === null
        ? null
        : UUID.fromString(SALE_PRODUCT_ID),
    productPresentationId: options?.presentationId
      ? UUID.fromString(options.presentationId)
      : options?.presentationId === null
        ? null
        : UUID.fromString(SALE_PRESENTATION_ID),
    productSnapshot: options?.snapshot === false ? null : {
      product: { id: SALE_PRODUCT_ID, name: "Agua", slug: "agua" },
      presentation: {
        id: options?.presentationId ?? SALE_PRESENTATION_ID,
        name: "Caja",
        barcode: "7501234567890",
        conversionFactor: 24,
      },
    },
    name: "Agua",
    unitPrice: options?.unitPrice ?? 1000,
    quantity: options?.quantity ?? 2,
  });
}