import { RegisterOrganizationCommand } from "./application/commands/register-organization.commad";
import { PgOrganizationRepository } from "./infrastructure/repositories/pg-organization.repository";
import { databaseService } from "@fludge/db";

const organizationRepository = new PgOrganizationRepository(databaseService);

const registerOrganizationCommand = new RegisterOrganizationCommand(
  organizationRepository,
);

export const organizationContainer = {
  commands: { register: registerOrganizationCommand },
};
