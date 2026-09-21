import { databaseService } from "@fludge/db";
import { SQLiteCustomerRepository } from "./infrastructure/repositories/sqlite-customer.repository";
import { SQLiteCustomerPaymentRepository } from "./infrastructure/repositories/sqlite-customer-payment.repository";
import { CreateCustomerCommand } from "./application/commands/create-customer.command";
import { UpdateCustomerCommand } from "./application/commands/update-customer.command";
import { CreateCustomerPaymentCommand } from "./application/commands/create-customer-payment.command";
import { UpdateCustomerBalanceService } from "./application/services/update-customer-balance.service";

// Repositories
const customerRepository = new SQLiteCustomerRepository(databaseService);
const customerPaymentRepository = new SQLiteCustomerPaymentRepository(
  databaseService,
);

// Commands
const createCustomerCommand = new CreateCustomerCommand(customerRepository);
const updateCustomerCommand = new UpdateCustomerCommand(customerRepository);
const createCustomerPaymentCommand = new CreateCustomerPaymentCommand(
  customerRepository,
  customerPaymentRepository,
);

// Services
const updateCustomerBalanceService = new UpdateCustomerBalanceService(
  customerRepository,
);

export const customerContainer = {
  commands: {
    createCustomerCommand,
    updateCustomerCommand,
    createCustomerPaymentCommand,
  },
  repositories: {
    customerRepository,
    customerPaymentRepository,
  },
  services: {
    updateCustomerBalanceService,
  },
};
