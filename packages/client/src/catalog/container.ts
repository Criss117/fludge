import type { ClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import type { CategoryRepository } from "./domain/category.repository";
import type { ProductRepository } from "./domain/product.repository";

type Deps = {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;

  syncCatalogRepository: ClientSyncCatalogRepository;
};

export function generateCatalogContainer(deps: Deps) {
  return {
    repositories: {
      productRepository: deps.productRepository,
      categoryRepository: deps.categoryRepository,
      syncCatalogRepository: deps.syncCatalogRepository,
    },
  };
}

export type CatalogContainer = ReturnType<typeof generateCatalogContainer>;
