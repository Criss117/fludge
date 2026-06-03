import { dbConnection } from "@fludge/db";
import { PGOrganizationCommandsRepository } from "./infrastructure/repositories/pg-organization-commands.repository";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";

const organizationsCommandsRepository = new PGOrganizationCommandsRepository(
  dbConnection,
);

export const registerOrganizationCommand = new RegisterOrganizationCommand(
  eventBus,
  organizationsCommandsRepository,
);

export const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationsCommandsRepository,
);

export const organizationsContainer = {
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
  },
  queries: {},
  repositories: {
    commands: {
      organizations: organizationsCommandsRepository,
    },
  },
} as const;
