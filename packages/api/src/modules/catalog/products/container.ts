import { databaseService } from "@fludge/db";
import { categoryContainer } from "../categories/container";
import { CreateProductCommand } from "./application/commands/create-product.command";
import { ProductUniquenessValidator } from "./application/services/product-uniqueness-validator.service";
import { ProductRepository } from "./infrastructure/repositories/product.repository";
import { ProductPresentationRepository } from "./infrastructure/repositories/product-presentation.repository";

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
};
