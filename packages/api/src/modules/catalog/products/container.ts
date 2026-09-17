import { databaseService } from "@fludge/db";
import { categoryContainer } from "../categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { ProductRepository } from "./infrastructure/repositories/product.repository";
import { ProductPresentationRepository } from "./infrastructure/repositories/product-presentation.repository";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";
import { UpdateProductCommand } from "./application/commands/update-product.command";
import { EnsurePresentationsExistsService } from "./application/services/ensure-presentations-exists.service";
import { SaleProductService } from "./application/services/sale-product.service";

//Repositories
const productPresentationRepository = new ProductPresentationRepository(
  databaseService,
);

const productRepository = new ProductRepository(
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
