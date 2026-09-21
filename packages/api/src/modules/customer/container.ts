import { databaseService } from "@fludge/db";
import { CustomerRepository } from "./infrastructure/repositories/customer.repository";
import { CreateCustomerCommand } from "./application/commands/create-customer.command";
import { UpdateCustomerCommand } from "./application/commands/update-customer.command";
import { UpdateCustomerBalanceService } from "./application/services/update-customer-balance.service";

// Repositories
const customerRepository = new CustomerRepository(databaseService);

// Commands
const createCustomerCommand = new CreateCustomerCommand(customerRepository);
const updateCustomerCommand = new UpdateCustomerCommand(customerRepository);

// Services
const updateCustomerBalanceService = new UpdateCustomerBalanceService(
  customerRepository,
);

export const customerContainer = {
  commands: {
    createCustomerCommand,
    updateCustomerCommand,
  },
  repositories: {
    customerRepository,
  },
  services: {
    updateCustomerBalanceService,
  },
};
