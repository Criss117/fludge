import { databaseService } from "@fludge/db";
import { SQLiteCustomerRepository } from "./infrastructure/repositories/sqlite-customer.repository";
import { SQLiteCustomerPaymentRepository } from "./infrastructure/repositories/sqlite-customer-payment.repository";
import { SQLiteCustomerPaymentApplicationRepository } from "./infrastructure/repositories/sqlite-customer-payment-application.repository";
import { CreateCustomerCommand } from "./application/commands/create-customer.command";
import { UpdateCustomerCommand } from "./application/commands/update-customer.command";
import { CreateCustomerPaymentCommand } from "./application/commands/create-customer-payment.command";
import { UpdateCustomerBalanceService } from "./application/services/update-customer-balance.service";
import { saleContainer } from "../sales/container";

// Repositories
const customerRepository = new SQLiteCustomerRepository(databaseService);
const customerPaymentRepository = new SQLiteCustomerPaymentRepository(
  databaseService,
);
const customerPaymentApplicationRepository =
  new SQLiteCustomerPaymentApplicationRepository(databaseService);

// Commands
const createCustomerCommand = new CreateCustomerCommand(customerRepository);
const updateCustomerCommand = new UpdateCustomerCommand(customerRepository);

// `saleContainer` forms an import cycle with `customerContainer` (sales/container.ts
// reads `customerContainer.repositories` and `.services`). Build the command lazily
// so this module's evaluation never touches an uninitialized binding.
let createCustomerPaymentCommand: CreateCustomerPaymentCommand | null = null;
const getCreateCustomerPaymentCommand = () => {
  if (!createCustomerPaymentCommand) {
    createCustomerPaymentCommand = new CreateCustomerPaymentCommand(
      customerRepository,
      customerPaymentRepository,
      saleContainer.repositories.saleRepository,
      saleContainer.services.paySaleService,
      customerPaymentApplicationRepository,
    );
  }

  return createCustomerPaymentCommand;
};

// Services
const updateCustomerBalanceService = new UpdateCustomerBalanceService(
  customerRepository,
);

export const customerContainer = {
  commands: {
    createCustomerCommand,
    updateCustomerCommand,
    get createCustomerPaymentCommand() {
      return getCreateCustomerPaymentCommand();
    },
  },
  repositories: {
    customerRepository,
    customerPaymentRepository,
    customerPaymentApplicationRepository,
  },
  services: {
    updateCustomerBalanceService,
  },
};