import { dbConnection } from "@fludge/db";
import { PGOrganizationCommandsRepository } from "./infrastructure/repositories/pg-organization-commands.repository";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

const organizationsCommandsRepository = new PGOrganizationCommandsRepository(
  dbConnection,
);

export const registerOrganizationCommand = new RegisterOrganizationCommand(
  eventBus,
  organizationsCommandsRepository,
);

export const organizationsContainer = {
  commands: {
    registerOrganization: registerOrganizationCommand,
  },
  queries: {},
  repositories: {
    commands: {
      organizations: organizationsCommandsRepository,
    },
  },
} as const;
