import { dbConnection } from "@fludge/db";
import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { PGOrganizationRepository } from "./infrastructure/repositories/pg-organization.repository";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { FindOrganizationsByMemberQuery } from "./application/queries/find-orgnizations-by-member.query";
import { FindActiveOrganizationQuery } from "./application/queries/find-active-organization.query";
import { OrganizationHasService } from "@fludge/api/modules/iam/organizations/application/services/organization-has.service";

const organizationsRepository = new PGOrganizationRepository(dbConnection);

// Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(eventBus);

const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationsRepository,
);

// Services
const organizationHasService = new OrganizationHasService(dbConnection);

// Queries
const findOrganizationsByMemberQuery = new FindOrganizationsByMemberQuery(
  dbConnection,
);

const findActiveOrganizationQuery = new FindActiveOrganizationQuery();

export const organizationsContainer = {
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
  },
  queries: {
    findAll: findOrganizationsByMemberQuery,
    findActive: findActiveOrganizationQuery,
  },
  services: {
    organizationHas: organizationHasService,
  },
  repositories: {
    commands: {
      organizations: organizationsRepository,
    },
  },
} as const;
