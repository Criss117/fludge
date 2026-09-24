import { databaseService } from "@fludge/db";
import { CreateProductCommand } from "@fludge/api/core/catalog/products/application/commands/create-product.command";
import { UpdateProductCommand } from "@fludge/api/core/catalog/products/application/commands/update-product.command";
import { EnsurePresentationsExistsService } from "@fludge/api/core/catalog/products/application/services/ensure-presentations-exists.service";
import { ProductUniquenessValidator } from "@fludge/api/core/catalog/products/application/services/product-uniqueness-validator.service";
import { SaleProductService } from "@fludge/api/core/catalog/products/application/services/sale-product.service";
import { SQLiteProductRepository } from "@fludge/api/core/catalog/products/infrastructure/repositories/sqlite-product.repository";
import { SQLiteCategoryRepository } from "./categories/infrastructure/repositories/sqlite-category.repository";
import { CategoryUniquenessValidator } from "./categories/application/services/category-uniqueness-validator.service";
import { EnsureCategoryExistsService } from "./categories/application/services/ensure-category-exists.service";
import { CreateCategoryCommand } from "./categories/application/commands/create-category.command";
import { UpdateCategoryCommand } from "./categories/application/commands/update-category.command";
import { ToggleCategoryStatusCommand } from "./categories/application/commands/toggle-category-status.command";

//Repositories
const productRepository = new SQLiteProductRepository(databaseService);

const categoryRepository = new SQLiteCategoryRepository(databaseService);

//Services
const productUniquenessValidator = new ProductUniquenessValidator(
  databaseService,
);
const ensurePresentationsExistsService = new EnsurePresentationsExistsService(
  databaseService,
);
const saleProductService = new SaleProductService(
  productRepository,
  ensurePresentationsExistsService,
);

const categoryUniquenessValidator = new CategoryUniquenessValidator(
  databaseService,
);
const ensureCategoryExistsService = new EnsureCategoryExistsService(
  databaseService,
);

//Commands
const createProductCommand = new CreateProductCommand(
  ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
);

const updateProductCommand = new UpdateProductCommand(
  ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
);

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

export const catalogContainer = {
  repositories: {
    productRepository,
    categoryRepository,
  },
  services: {
    productUniquenessValidator,
    ensurePresentationsExistsService,
    saleProductService,
    categoryUniquenessValidator,
    ensureCategoryExistsService,
  },
  commands: {
    createProductCommand,
    updateProductCommand,
    createCategoryCommand,
    updateCategoryCommand,
    toggleCategoryStatusCommand,
  },
} as const;
