import type { AuditMetadata } from "./audit-metadata";
import type { BrandSummary } from "./brand.entity";
import type { CategorySummary } from "./category.entity";
import type { ProvidersSummary } from "./providers.schema";

export interface ProductDetail extends AuditMetadata {
  id: string;
  name: string;
  barcode: string;
  description: string | null;
  category: CategorySummary | null;
  brandId: BrandSummary | null;
  businessId: string | null;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number;
  offerPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  allowsNegativeInventory: boolean;
  weight: number | null;
  imageUrl: string | null;
  providers: ProvidersSummary[];
}

export interface ProductSummary extends AuditMetadata {
  id: string;
  name: string;
  barcode: string;
  description: string | null;
  categoryId: string | null;
  brandId: string | null;
  businessId: string | null;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number;
  offerPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  allowsNegativeInventory: boolean;
  weight: number | null;
  imageUrl: string | null;
}
