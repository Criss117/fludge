import { dbConnection } from "@fludge/db";
import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { PGOrganizationCommandsRepository } from "./infrastructure/repositories/pg-organization-commands.repository";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { FindOrganizationsByOwnerQuery } from "./application/queries/find-orgnizations-by-owner.query";

const organizationsCommandsRepository = new PGOrganizationCommandsRepository(
  dbConnection,
);

// Commands
export const registerOrganizationCommand = new RegisterOrganizationCommand(
  eventBus,
);

export const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationsCommandsRepository,
);

// Queries
export const findOrganizationsByOwnerQuery = new FindOrganizationsByOwnerQuery(
  dbConnection,
);

export const organizationsContainer = {
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
  },
  queries: {
    findByOwner: findOrganizationsByOwnerQuery,
  },
  repositories: {
    commands: {
      organizations: organizationsCommandsRepository,
    },
  },
} as const;
