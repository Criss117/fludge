import { databaseService } from "@fludge/db";
import { SaleRepository } from "./infrastructure/repositories/sale.repository";
import { SaleSequenceRepository } from "./infrastructure/repositories/sale-sequense.repository";
import { SaleItemRepository } from "./infrastructure/repositories/sale-item.repository";
import { CreateSaleCommand } from "./application/commands/create-sale.command";
import { productContainer } from "../catalog/products/container";
import { FindAllSalesQuery } from "./application/queries/find-all-sales.query";
import { customerContainer } from "../customer/container";
import { CancelSaleCommand } from "./application/commands/cancel-sale.command";

// Repositories
const saleSequenceRepository = new SaleSequenceRepository(databaseService);
const saleItemRepository = new SaleItemRepository(databaseService);
const saleRepository = new SaleRepository(databaseService, saleItemRepository);

// Commands
const createSaleCommand = new CreateSaleCommand(
  saleRepository,
  saleSequenceRepository,
  productContainer.repositories.productRepository,
  productContainer.services.saleProductService,
  customerContainer.repositories.customerRepository,
);

const cancelSaleCommand = new CancelSaleCommand(
  saleRepository,
  productContainer.repositories.productRepository,
);

// Queries
const findAllSalesQuery = new FindAllSalesQuery(databaseService);

export const saleContainer = {
  commands: {
    createSaleCommand,
    cancelSaleCommand,
  },
  queries: {
    findAllSalesQuery,
  },
  repositories: {
    saleRepository: saleRepository,
    saleSequenceRepository,
    saleItemRepository,
  },
};
