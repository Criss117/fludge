import { databaseService } from "@fludge/db";
import { SQLiteSaleRepository } from "./infrastructure/repositories/sqlite-sale.repository";
import { SQLiteSaleSequenceRepository } from "./infrastructure/repositories/sqlite-sale-sequence.repository";
import { SQLiteSaleItemRepository } from "./infrastructure/repositories/sqlite-sale-item.repository";
import { CreateSaleCommand } from "./application/commands/create-sale.command";
import { productContainer } from "../catalog/products/container";
import { FindAllSalesQuery } from "./application/queries/find-all-sales.query";
import { customerContainer } from "../customer/container";
import { CancelSaleCommand } from "./application/commands/cancel-sale.command";
import { PaySaleService } from "./application/services/pay-sale.service";

// Repositories
const saleSequenceRepository = new SQLiteSaleSequenceRepository(
  databaseService,
);
const saleItemRepository = new SQLiteSaleItemRepository(databaseService);
const saleRepository = new SQLiteSaleRepository(
  databaseService,
  saleItemRepository,
);

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
  customerContainer.repositories.customerRepository,
  customerContainer.services.updateCustomerBalanceService,
);

// Queries
const findAllSalesQuery = new FindAllSalesQuery(databaseService);

// Services
const paySaleService = new PaySaleService(saleRepository);

export const saleContainer = {
  commands: {
    createSaleCommand,
    cancelSaleCommand,
  },
  queries: {
    findAllSalesQuery,
  },
  repositories: {
    saleRepository,
    saleSequenceRepository,
    saleItemRepository,
  },
  services: {
    paySaleService,
  },
};
