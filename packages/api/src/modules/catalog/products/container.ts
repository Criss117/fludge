import { databaseService } from "@fludge/db";
import { categoryContainer } from "../categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { ProductRepository } from "./infrastructure/repositories/product.repository";
import { ProductPresentationRepository } from "./infrastructure/repositories/product-presentation.repository";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";

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

//Queries
const findAllProductsQuery = new FindAllProductsQuery(databaseService);

//Commands
const createProductCommand = new CreateProductCommand(
  categoryContainer.services.ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
);

export const productContainer = {
  commands: {
    create: createProductCommand,
  },
  queries: {
    findAll: findAllProductsQuery,
  },
  repositories: {
    productRepository,
  },
  services: {
    productUniquenessValidator,
    productRepository,
  },
};
