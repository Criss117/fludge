import { databaseService } from "@fludge/db";

import { RegisterOrganizationCommand } from "./application/commands/register-organization.commad";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { PgOrganizationRepository } from "./infrastructure/repositories/pg-organization.repository";
import { FindAllOrganizationsQuery } from "./application/queries/find-all-organizations.query";
import { EnsureOrganizationExistsService } from "./application/services/ensure-organization-exists.service";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { CreateGroupCommand } from "./application/commands/create-group.command";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { AddMemberCommand } from "./application/commands/add-member.command";
import { AssignMembersToGroupCommand } from "./application/commands/assign-members-to-group.command";
import { AssignGroupsToMemberCommand } from "./application/commands/assign-groups-to-member.command";

//Repositories
const organizationRepository = new PgOrganizationRepository(databaseService);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);
const ensureOrganizationExistsService = new EnsureOrganizationExistsService(
  databaseService,
);

//Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
);
const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
);

const createGroupCommand = new CreateGroupCommand(organizationRepository);
const updateGroupCommand = new UpdateGroupCommand(organizationRepository);

const addMemberCommand = new AddMemberCommand(organizationRepository);

const assignMembersToGroupCommand = new AssignMembersToGroupCommand(
  organizationRepository,
);

const assignGroupsToMemberCommand = new AssignGroupsToMemberCommand(
  organizationRepository,
);

//Queries
const findAllOrganizationsQuery = new FindAllOrganizationsQuery(
  databaseService,
);

export const organizationContainer = {
  repositories: { organizationRepository },
  services: {
    organizationUniquenessValidator,
    ensureOrganizationExistsService,
  },
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,

    group: {
      create: createGroupCommand,
      update: updateGroupCommand,
      assignMembers: assignMembersToGroupCommand,
    },

    member: {
      add: addMemberCommand,
      assignGroups: assignGroupsToMemberCommand,
    },
  },
  queries: { findAll: findAllOrganizationsQuery },
} as const;
