import type { CategoryRepository } from "./domain/category.repository";
import type { ProductRepository } from "./domain/product.repository";

type Deps = {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
};

export function generateCatalogContainer(deps: Deps) {
  return {
    repositories: {
      productRepository: deps.productRepository,
      categoryRepository: deps.categoryRepository,
    },
  };
}

export type CatalogContainer = ReturnType<typeof generateCatalogContainer>;
