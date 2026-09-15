import { SQLiteCategoryRepository } from "@/modules/catalog/repositories/category.repository";
import { generateCatalogContainer } from "@fludge/client/application/catalog/container";
import { databaseService } from "../db";
import { SQLiteProductRepository } from "@/modules/catalog/repositories/product.repository";
import { LocalClientCatalogRepository } from "../db/repositories/sync-catalog.repository";

const productRepository = new SQLiteProductRepository(databaseService);
const categoryRepository = new SQLiteCategoryRepository(databaseService);

const syncCatalogRepository = new LocalClientCatalogRepository(databaseService);

export const catalogContainer = generateCatalogContainer({
  categoryRepository,
  productRepository,
  syncCatalogRepository,
});
