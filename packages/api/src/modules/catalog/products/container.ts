import { databaseService } from "@fludge/db";
import { categoryContainer } from "../categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { SQLiteProductRepository } from "./infrastructure/repositories/sqlite-product.repository";
import { SQLiteProductPresentationRepository } from "./infrastructure/repositories/sqlite-product-presentation.repository";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";
import { UpdateProductCommand } from "./application/commands/update-product.command";
import { EnsurePresentationsExistsService } from "./application/services/ensure-presentations-exists.service";
import { SaleProductService } from "./application/services/sale-product.service";

//Repositories
const productPresentationRepository = new SQLiteProductPresentationRepository(
  databaseService,
);

const productRepository = new SQLiteProductRepository(
  databaseService,
  productPresentationRepository,
);

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

//Queries
const findAllProductsQuery = new FindAllProductsQuery(databaseService);

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
  commands: {
    create: createProductCommand,
    update: updateProductCommand,
  },
  queries: {
    findAll: findAllProductsQuery,
  },
  repositories: {
    productRepository,
  },
  services: {
    productUniquenessValidator,
    ensurePresentationsExistsService,
    saleProductService,
  },
};
