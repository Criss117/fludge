import { dbConnection } from "@fludge/db";

import { CreateCategoryCommand } from "./application/commands/create-category.command";
import { UpdateCategoryCommand } from "./application/commands/update-category.command";
import { HardDeleteCategoriesCommand } from "./application/commands/delete-categories.command";
import { FindAllCategoriesQuery } from "./application/queries/find-all-categories.query";
import { PGCategoriesCommandsRepository } from "./infrastructure/repositories/pg-categories-commands.repository";

// Repositories
const categoriesCommandsRepository = new PGCategoriesCommandsRepository(
  dbConnection,
);

// Commands
const createCategoryCommand = new CreateCategoryCommand(
  categoriesCommandsRepository,
);
const updateCategoryCommand = new UpdateCategoryCommand(
  categoriesCommandsRepository,
);
const hardDeleteCategoriesCommand = new HardDeleteCategoriesCommand(
  categoriesCommandsRepository,
);

// Queries
const findAllCategoriesQuery = new FindAllCategoriesQuery(dbConnection);

export const categoriesContainer = {
  commands: {
    create: createCategoryCommand,
    update: updateCategoryCommand,
    delete: hardDeleteCategoriesCommand,
  },
  queries: {
    findAll: findAllCategoriesQuery,
  },
} as const;