import { databaseService } from "@fludge/db";
import { CustomerRepository } from "./infrastructure/repositories/customer.repository";
import { CreateCustomerCommand } from "./application/commands/create-customer.command";

// Repositories
const customerRepository = new CustomerRepository(databaseService);

// Commands
const createCustomerCommand = new CreateCustomerCommand(customerRepository);

export const customerContainer = {
  commands: {
    createCustomerCommand,
  },
  repositories: {
    customerRepository,
  },
};
