import { dbConnection } from "@fludge/db";

import { CreateProductCommand } from "./application/commands/create-product.command";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";
import { PGProductRepository } from "./infrastructure/repositories/pg-product.repository";
import { categoriesContainer } from "@fludge/api/modules/catalog/categories/container";
import { PGProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product-presentation.repository";
import { ProductService } from "@fludge/api/modules/catalog/products/application/services/product.service";

// Repositories
const productRepository = new PGProductRepository(dbConnection);
const productPresentationRepository = new PGProductPresentationRepository(
  dbConnection,
);

// Services
const productService = new ProductService(dbConnection);

// Commands
const createProductCommand = new CreateProductCommand(
  productRepository,
  productPresentationRepository,
  categoriesContainer.repositories.categoryRepository,
  productService,
);

// Queries
const findAllProductsQuery = new FindAllProductsQuery(dbConnection);

export const productsContainer = {
  commands: {
    create: createProductCommand,
    delete: () => {},
    update: () => {},
  },
  queries: {
    findAll: findAllProductsQuery,
  },
} as const;
