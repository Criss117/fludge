import { databaseService } from "@fludge/db";
import { categoryContainer } from "../../catalog/categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { UpdateProductCommand } from "./application/commands/update-product.command";
import { EnsurePresentationsExistsService } from "./application/services/ensure-presentations-exists.service";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { SaleProductService } from "./application/services/sale-product.service";
import { SQLiteProductRepository } from "./infrastructure/repositories/sqlite-product.repository";

const productRepository = new SQLiteProductRepository(databaseService);

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

//Commands
const createProductCommand = new CreateProductCommand(
  categoryContainer.services.ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
);

const updateProductCommand = new UpdateProductCommand(
  categoryContainer.services.ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
);

export const productContainer = {
  repositories: { productRepository },
  services: {
    productUniquenessValidator,
    ensurePresentationsExistsService,
    saleProductService,
  },
  commands: {
    create: createProductCommand,
    update: updateProductCommand,
  },
} as const;
