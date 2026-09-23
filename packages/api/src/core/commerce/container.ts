import { databaseService } from "@fludge/db";
import { productContainer } from "../catalog/products/container";

// Customer repositories
import { SQLiteCustomerRepository } from "./customer/infrastructure/repositories/sqlite-customer.repository";
import { SQLiteCustomerPaymentRepository } from "./customer/infrastructure/repositories/sqlite-customer-payment.repository";

// Sale repositories
import { SQLiteSaleRepository } from "./sale/infrastructure/repositories/sqlite-sale.repository";
import { SQLiteSalePaymentRepository } from "./sale/infrastructure/repositories/sqlite-sale-payment.repository";
import { SQLiteSaleSequenceRepository } from "./sale/infrastructure/repositories/sqlite-sale-sequence.repository";

// Customer services
import { DecreaseCustomerBalanceService } from "./customer/application/services/decrease-customer-balance.service";

// Sale services
import { PaySaleService } from "./sale/application/services/pay-sale.service";
import { RevertSalePaymentsService } from "./sale/application/services/revert-sale-payments.service";
import { RefundProductsService } from "./sale/application/services/refund-products.service";

// Customer commands
import { CreateCustomerCommand } from "./customer/application/commands/create-customer.command";
import { UpdateCustomerCommand } from "./customer/application/commands/update-customer.command";
import { CreateCustomerPaymentCommand } from "./customer/application/commands/create-customer-payment.command";
import { CancelCustomerPaymentCommand } from "./customer/application/commands/cancel-customer-payment.command";

// Sale commands
import { CreateSaleCommand } from "./sale/application/commands/create-sale.command";
import { CancelSaleCommand } from "./sale/application/commands/cancel-sale.command";
import { RefundSaleItemsCommand } from "./sale/application/commands/refund-sale-items.command";

// ── Repositories ──────────────────────────────────────────────────────────────

const customerRepository = new SQLiteCustomerRepository(databaseService);
const customerPaymentRepository = new SQLiteCustomerPaymentRepository(
  databaseService,
);
const saleRepository = new SQLiteSaleRepository(databaseService);
const salePaymentRepository = new SQLiteSalePaymentRepository(databaseService);
const saleSequenceRepository = new SQLiteSaleSequenceRepository(databaseService);

// ── Services ─────────────────────────────────────────────────────────────────

const decreaseCustomerBalanceService = new DecreaseCustomerBalanceService(
  customerRepository,
);
const paySaleService = new PaySaleService(saleRepository);
const revertSalePaymentsService = new RevertSalePaymentsService(
  salePaymentRepository,
  saleRepository,
);
const refundProductsService = new RefundProductsService(
  productContainer.repositories.productRepository,
);

// ── Commands ─────────────────────────────────────────────────────────────────

const createCustomerCommand = new CreateCustomerCommand(customerRepository);
const updateCustomerCommand = new UpdateCustomerCommand(customerRepository);
const createCustomerPaymentCommand = new CreateCustomerPaymentCommand(
  customerRepository,
  customerPaymentRepository,
  saleRepository,
  salePaymentRepository,
  paySaleService,
);
const cancelCustomerPaymentCommand = new CancelCustomerPaymentCommand(
  customerRepository,
  customerPaymentRepository,
  saleRepository,
  salePaymentRepository,
  revertSalePaymentsService,
);

const createSaleCommand = new CreateSaleCommand(
  saleRepository,
  saleSequenceRepository,
  productContainer.repositories.productRepository,
  productContainer.services.saleProductService,
  customerRepository,
);
const cancelSaleCommand = new CancelSaleCommand(
  saleRepository,
  salePaymentRepository,
  customerRepository,
  productContainer.repositories.productRepository,
  decreaseCustomerBalanceService,
  refundProductsService,
);
const refundSaleItemsCommand = new RefundSaleItemsCommand(
  saleRepository,
  customerRepository,
  productContainer.repositories.productRepository,
  decreaseCustomerBalanceService,
  refundProductsService,
);

// ── Export ────────────────────────────────────────────────────────────────────

export const commerceContainer = {
  repositories: {
    customerRepository,
    customerPaymentRepository,
    saleRepository,
    salePaymentRepository,
    saleSequenceRepository,
  },
  services: {
    decreaseCustomerBalanceService,
    paySaleService,
    revertSalePaymentsService,
    refundProductsService,
  },
  commands: {
    customer: {
      create: createCustomerCommand,
      update: updateCustomerCommand,
      createPayment: createCustomerPaymentCommand,
      cancelPayment: cancelCustomerPaymentCommand,
    },
    sale: {
      create: createSaleCommand,
      cancel: cancelSaleCommand,
      refundItems: refundSaleItemsCommand,
    },
  },
} as const;
