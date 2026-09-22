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
// `customerContainer` forms an import cycle with `saleContainer` (customer/container.ts
// reads `saleContainer.repositories.saleRepository` and `.services.paySaleService`).
// Wrap cross-container wiring in memoized lazy getters so module evaluation never
// touches an uninitialized binding, keeping the cycle safe for any import order.
let createSaleCommand: CreateSaleCommand | null = null;
const getCreateSaleCommand = () => {
  if (!createSaleCommand) {
    createSaleCommand = new CreateSaleCommand(
      saleRepository,
      saleSequenceRepository,
      productContainer.repositories.productRepository,
      productContainer.services.saleProductService,
      customerContainer.repositories.customerRepository,
    );
  }

  return createSaleCommand;
};

let cancelSaleCommand: CancelSaleCommand | null = null;
const getCancelSaleCommand = () => {
  if (!cancelSaleCommand) {
    cancelSaleCommand = new CancelSaleCommand(
      saleRepository,
      productContainer.repositories.productRepository,
      customerContainer.repositories.customerRepository,
      customerContainer.services.updateCustomerBalanceService,
    );
  }

  return cancelSaleCommand;
};

// Queries
const findAllSalesQuery = new FindAllSalesQuery(databaseService);

// Services
const paySaleService = new PaySaleService(saleRepository);

export const saleContainer = {
  commands: {
    get createSaleCommand() {
      return getCreateSaleCommand();
    },
    get cancelSaleCommand() {
      return getCancelSaleCommand();
    },
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
