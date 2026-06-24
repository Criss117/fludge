import { dbConnection } from "@fludge/db";

import { CreateProductCommand } from "./application/commands/create-product.command";
import { UpdateProductCommand } from "./application/commands/update-product.command";
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
const updateProductCommand = new UpdateProductCommand(
  productsCommandsRepository,
  categoriesCommandsRepository,
);

// Queries
const findAllProductsQuery = new FindAllProductsQuery(dbConnection);

export const productsContainer = {
  commands: {
    create: createProductCommand,
    update: updateProductCommand,
  },
  queries: {
    findAll: findAllProductsQuery,
  },
} as const;