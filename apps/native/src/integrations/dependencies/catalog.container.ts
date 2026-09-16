import { NativeCategoryRepository } from "@/modules/catalog/repositories/native-category.repository";
import { generateCatalogContainer } from "@fludge/client/application/catalog/container";
import { databaseService } from "../db";
import { NativeProductRepository } from "@/modules/catalog/repositories/native-product.repository";
import { NativeSyncCatalogRepository } from "../db/repositories/native-sync-catalog.repository";

const productRepository = new NativeProductRepository(databaseService);
const categoryRepository = new NativeCategoryRepository(databaseService);

const syncCatalogRepository = new NativeSyncCatalogRepository(databaseService);

export const catalogContainer = generateCatalogContainer({
  categoryRepository,
  productRepository,
  syncCatalogRepository,
});
