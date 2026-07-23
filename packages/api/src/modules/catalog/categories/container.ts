import { dbConnection } from "@fludge/db";

import { CreateCategoryCommand } from "./application/commands/create-category.command";
import { UpdateCategoryCommand } from "./application/commands/update-category.command";
import { HardDeleteCategoriesCommand } from "./application/commands/delete-categories.command";
import { FindAllCategoriesQuery } from "./application/queries/find-all-categories.query";
import { PGCategoryRepository } from "./infrastructure/repositories/pg-category.repository";

// Repositories
const categoryRepository = new PGCategoryRepository(dbConnection);

// Commands
const createCategoryCommand = new CreateCategoryCommand(categoryRepository);
const updateCategoryCommand = new UpdateCategoryCommand(categoryRepository);
const hardDeleteCategoriesCommand = new HardDeleteCategoriesCommand(
  categoryRepository,
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
  repositories: {
    categoryRepository,
  },
} as const;
