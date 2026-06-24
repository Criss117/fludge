import { dbConnection } from "@fludge/db";

import { CreateProductCommand } from "./application/commands/create-product.command";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";
import { PGProductsCommandsRepository } from "./infrastructure/repositories/pg-products-commands.repository";
import { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";

// Repositories
const productsCommandsRepository = new PGProductsCommandsRepository(
  dbConnection,
);
const categoriesCommandsRepository = new PGCategoriesCommandsRepository(
  dbConnection,
);

// Commands
const createProductCommand = new CreateProductCommand(
  productsCommandsRepository,
  categoriesCommandsRepository,
);

// Queries
const findAllProductsQuery = new FindAllProductsQuery(dbConnection);

export const productsContainer = {
  commands: {
    create: createProductCommand,
  },
  queries: {
    findAll: findAllProductsQuery,
  },
} as const;