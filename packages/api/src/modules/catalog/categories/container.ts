import { databaseService } from "@fludge/db";
import { CategoryRepository } from "./infrastructure/repositories/category.repository";
import { CategoryUniquenessValidator } from "./application/services/category-uniqueness-validator.service";
import { CreateCategoryCommand } from "./application/commands/create-category.command";
import { DeleteCategoryCommand } from "./application/commands/delete-category.command";
import { UpdateCategoryCommand } from "./application/commands/update-category.command";
import { FindAllCategoriesQuery } from "./application/queries/find-all-categories.query";

//Repositories
const categoryRepository = new CategoryRepository(databaseService);

//Services
const categoryUniquenessValidator = new CategoryUniquenessValidator(
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
const deleteCategoryCommand = new DeleteCategoryCommand(categoryRepository);

//Queries
const findAllCategoriesQuery = new FindAllCategoriesQuery(databaseService);

export const categoryContainer = {
  repositories: { categoryRepository },
  services: {
    categoryUniquenessValidator,
  },
  commands: {
    create: createCategoryCommand,
    update: updateCategoryCommand,
    delete: deleteCategoryCommand,
  },
  queries: {
    findAll: findAllCategoriesQuery,
  },
};
