import { databaseService } from "@fludge/db";
import { CreateCategoryCommand } from "./application/commands/create-category.command";
import { UpdateCategoryCommand } from "./application/commands/update-category.command";
import { ToggleCategoryStatusCommand } from "./application/commands/toggle-category-status.command";
import { CategoryUniquenessValidator } from "./application/services/category-uniqueness-validator.service";
import { EnsureCategoryExistsService } from "./application/services/ensure-category-exists.service";
import { SQLiteCategoryRepository } from "./infrastructure/repositories/sqlite-category.repository";

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
} as const;
