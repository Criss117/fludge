import { desc, eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { product } from "@fludge/db/schema/product";
import type { PaginatedValidator } from "@fludge/utils/validators/utils";

const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    sku: `PROD-${String(i + 1).padStart(3, "0")}`,
    name: `Producto de Prueba ${i + 1}`,
    description: `Descripción detallada para el producto ${i + 1}`,
    wholesalePrice: Math.floor(Math.random() * 1000) + 500,
    salePrice: Math.floor(Math.random() * 2000) + 1500,
    costPrice: Math.floor(Math.random() * 500) + 100,
    stock: Math.floor(Math.random() * 100),
    minStock: 10,
    categoryId: null,
    organizationId: "CWayJjyScjtYslNEvLsHrGdII6BXYfXR",
    supplierId: null,
    createdAt: new Date(new Date().getSeconds() + i * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    isActive: true,
  }));
};

export class FindManyProductsUseCase {
  public async execute(organizationid: string, filters: PaginatedValidator) {
    return db
      .select()
      .from(product)
      .where(eq(product.organizationId, organizationid))
      .limit(filters.limit)
      .offset(filters.offset)
      .orderBy(desc(product.createdAt));
  }
}

export const findManyProductsUseCase = new FindManyProductsUseCase();
