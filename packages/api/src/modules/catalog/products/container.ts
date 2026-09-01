import { databaseService } from "@fludge/db";
import { categoryContainer } from "../categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { ProductRepository } from "./infrastructure/repositories/product.repository";
import { ProductPresentationRepository } from "./infrastructure/repositories/product-presentation.repository";
import { FindAllProductsQuery } from "./application/queries/find-all-products.query";
import { UpdateProductCommand } from "./application/commands/update-product.command";
import { DeleteProductCommand } from "./application/commands/delete-product.command";

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

const updateProductCommand = new UpdateProductCommand(
  categoryContainer.services.ensureCategoryExistsService,
  productUniquenessValidator,
  productRepository,
  productPresentationRepository,
);

const deleteProductCommand = new DeleteProductCommand(productRepository);

export const productContainer = {
  commands: {
    create: createProductCommand,
    update: updateProductCommand,
    delete: deleteProductCommand,
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
