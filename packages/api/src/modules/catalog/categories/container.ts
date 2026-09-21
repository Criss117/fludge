import { databaseService } from "@fludge/db";
import { SQLiteCategoryRepository } from "./infrastructure/repositories/sqlite-category.repository";
import { CategoryUniquenessValidator } from "./application/services/category-uniqueness-validator.service";
import { CreateCategoryCommand } from "./application/commands/create-category.command";
import { UpdateCategoryCommand } from "./application/commands/update-category.command";
import { FindAllCategoriesQuery } from "./application/queries/find-all-categories.query";
import { EnsureCategoryExistsService } from "./application/services/ensure-category-exists.service";
import { ToggleCategoryStatusCommand } from "./application/commands/toogle-category-status.command";

//Repositories
const categoryRepository = new SQLiteCategoryRepository(databaseService);

//Services
const categoryUniquenessValidator = new CategoryUniquenessValidator(
  databaseService,
);
const ensureCategoryExistsService = new EnsureCategoryExistsService(
  databaseService,
);
//Commands
const createCategoryCommand = new CreateCategoryCommand(
  categoryRepository,
  categoryUniquenessValidator,
);
const updateCategoryCommand = new UpdateCategoryCommand(
  categoryRepository,
  categoryUniquenessValidator,
);

const toggleCategoryStatusCommand = new ToggleCategoryStatusCommand(
  categoryRepository,
);

//Queries
const findAllCategoriesQuery = new FindAllCategoriesQuery(databaseService);

export const categoryContainer = {
  repositories: { categoryRepository },
  services: {
    categoryUniquenessValidator,
    ensureCategoryExistsService,
  },
  commands: {
    create: createCategoryCommand,
    update: updateCategoryCommand,
    toggleStatus: toggleCategoryStatusCommand,
  },
  queries: {
    findAll: findAllCategoriesQuery,
  },
};
