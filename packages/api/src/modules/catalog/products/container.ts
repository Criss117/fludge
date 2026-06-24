import { dbConnection } from "@fludge/db";

import { CreateProductCommand } from "./application/commands/create-product.command";
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

export const productsContainer = {
  commands: {
    create: createProductCommand,
  },
} as const;