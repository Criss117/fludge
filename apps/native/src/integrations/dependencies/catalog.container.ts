import { NativeCategoryRepository } from "@/core/catalog/repositories/native-category.repository";
import { generateCatalogContainer } from "@fludge/client/catalog/container";
import { databaseService } from "@/integrations/db";
import { NativeProductRepository } from "@/core/catalog/repositories/native-product.repository";
import { NativeSyncCatalogRepository } from "@/integrations/db/repositories/native-sync-catalog.repository";

const productRepository = new NativeProductRepository(databaseService);
const categoryRepository = new NativeCategoryRepository(databaseService);

const syncCatalogRepository = new NativeSyncCatalogRepository(databaseService);

export const catalogContainer = generateCatalogContainer({
  categoryRepository,
  productRepository,
  syncCatalogRepository,
});
