import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { ProductPresentation } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.entity";
import type { CreateProductPresentation } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.entity";
import { UUID } from "@fludge/utils/uuid";

export type BuildProductOptions = {
  name?: string;
  stock?: number;
  minStock?: number;
  allowNegativeStock?: boolean;
  barcodes?: Array<string | null>;
  categoryId?: string | null;
};

export function buildProduct(options?: BuildProductOptions) {
  const barcodes = options?.barcodes ?? ["7501234567890"];

  const presentations: CreateProductPresentation[] = barcodes.map(
    (barcode, index) => ({
      name: `Presentación ${index + 1}`,
      productName: options?.name ?? "Agua",
      barcode,
      conversionFactor: 24,
      pricePurchase: 800,
      priceSale: 1000,
      priceWholesale: 900,
      organizationId: "00000000-0000-4000-8000-000000000001",
      createdBy: "00000000-0000-4000-8000-000000000002",
    }),
  );

  return Product.create({
    name: options?.name ?? "Agua",
    categoryId: options?.categoryId,
    description: "Botella de agua 500ml",
    stock: options?.stock ?? 100,
    allowNegativeStock: options?.allowNegativeStock ?? false,
    minStock: options?.minStock ?? 10,
    createdBy: "00000000-0000-4000-8000-000000000002",
    organizationId: "00000000-0000-4000-8000-000000000001",
    presentations,
  });
}

export function buildPresentation(options?: {
  barcode?: string | null;
  name?: string;
  conversionFactor?: number;
}) {
  return ProductPresentation.create({
    name: options?.name ?? "Caja",
    productName: "Agua",
    barcode: options?.barcode !== undefined ? options.barcode : "7501234567890",
    conversionFactor: options?.conversionFactor ?? 24,
    pricePurchase: 800,
    priceSale: 1000,
    priceWholesale: 900,
    organizationId: "00000000-0000-4000-8000-000000000001",
    createdBy: "00000000-0000-4000-8000-000000000002",
  });
}

export function makeOrganizationId() {
  return UUID.fromString("00000000-0000-4000-8000-000000000001");
}

export function makeUserId() {
  return UUID.fromString("00000000-0000-4000-8000-000000000002");
}