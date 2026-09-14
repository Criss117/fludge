import { SQLiteCategoryRepository } from "@/modules/catalog/repositories/category.repository";
import { generateCatalogContainer } from "@fludge/client/application/catalog/container";
import { databaseService } from "../db";
import { SQLiteProductRepository } from "@/modules/catalog/repositories/product.repository";

const productRepository = new SQLiteProductRepository(databaseService);
const categoryRepository = new SQLiteCategoryRepository(databaseService);

export const catalogContainer = generateCatalogContainer({
  categoryRepository,
  productRepository,
});
