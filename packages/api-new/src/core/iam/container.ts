import { databaseService } from "@fludge/db";

import { CreateGroupCommand } from "./application/commands/create-group.command";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { GroupUniquenessValidator } from "./application/services/group-uniqueness-validator.service";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { SQLiteGroupRepository } from "./infrastructure/repositories/sqlite-group-repository";
import { SQLiteMemberRepository } from "./infrastructure/repositories/sqlite-member-repository";
import { SQLiteOrganizationRepository } from "./infrastructure/repositories/sqlite-organization.repository";

//Repositories
const memberRepository = new SQLiteMemberRepository(databaseService);
const groupRepository = new SQLiteGroupRepository(databaseService);
const organizationRepository = new SQLiteOrganizationRepository(databaseService);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);
const groupUniquenessValidator = new GroupUniquenessValidator(databaseService);

//Commands
const registerOrganizationCommand = new RegisterOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
  memberRepository,
  groupRepository,
);

const updateOrganizationCommand = new UpdateOrganizationCommand(
  organizationUniquenessValidator,
  organizationRepository,
);

const createGroupCommand = new CreateGroupCommand(
  groupUniquenessValidator,
  groupRepository,
  memberRepository,
);

export const organizationContainer = {
  repositories: { organizationRepository },
  services: { organizationUniquenessValidator, groupUniquenessValidator },
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
    group: {
      create: createGroupCommand,
    },
  },
} as const;