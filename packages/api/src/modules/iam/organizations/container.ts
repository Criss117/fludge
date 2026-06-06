import { dbConnection } from "@fludge/db";
import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { PGOrganizationCommandsRepository } from "./infrastructure/repositories/pg-organization-commands.repository";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { FindOrganizationsByMemberQuery } from "./application/queries/find-orgnizations-by-member.query";
import { OrganizationHasMembersQuery } from "./application/queries/organization-has-members.query";
import { OrganizationHasGroupsQuery } from "./application/queries/organization-has-groups.query";
import { FindActiveOrganizationQuery } from "./application/queries/find-active-organization.query";

const organizationsCommandsRepository = new PGOrganizationCommandsRepository(
  dbConnection,
);

// Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(eventBus);

const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationsCommandsRepository,
);

// Queries
const findOrganizationsByMemberQuery = new FindOrganizationsByMemberQuery(
  dbConnection,
);
const organizationHasMembersQuery = new OrganizationHasMembersQuery(
  dbConnection,
);
const organizationHasGroupsQuery = new OrganizationHasGroupsQuery(dbConnection);
const findActiveOrganizationQuery = new FindActiveOrganizationQuery();

export const organizationsContainer = {
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
  },
  queries: {
    findAll: findOrganizationsByMemberQuery,
    findActive: findActiveOrganizationQuery,
    organizationHasMembers: organizationHasMembersQuery,
    organizationHasGroups: organizationHasGroupsQuery,
  },
  repositories: {
    commands: {
      organizations: organizationsCommandsRepository,
    },
  },
} as const;
