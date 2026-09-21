import { databaseService } from "@fludge/db";

import { RegisterOrganizationCommand } from "./application/commands/register-organization.commad";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { SQLiteOrganizationRepository } from "./infrastructure/repositories/sqlite-organization.repository";
import { FindAllOrganizationsQuery } from "./application/queries/find-all-organizations.query";
import { EnsureOrganizationExistsService } from "./application/services/ensure-organization-exists.service";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { CreateGroupCommand } from "./application/commands/create-group.command";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { AddMemberCommand } from "./application/commands/add-member.command";
import { AssignMembersToGroupCommand } from "./application/commands/assign-members-to-group.command";
import { AssignGroupsToMemberCommand } from "./application/commands/assign-groups-to-member.command";
import { SQLiteMemberRepository } from "./infrastructure/repositories/sqlite-member.repository";
import { SQLiteGroupRepository } from "./infrastructure/repositories/sqlite-group.repository";
import { SQLiteGroupMemberRepository } from "./infrastructure/repositories/sqlite-group-member.repository";
import { DeleteGroupsCommand } from "./application/commands/delete-groups.command";
import { RemoveMembersFromGroupCommand } from "./application/commands/remove-members-from-group.command";
import { RemoveGroupsFromMemberCommand } from "./application/commands/remove-groups-from-member.command";
import { FindAllMembersQuery } from "./application/queries/find-all-members.query";

//Repositories
const memberRepository = new SQLiteMemberRepository(databaseService);
const groupRepository = new SQLiteGroupRepository(databaseService);
const groupMemberRepository = new SQLiteGroupMemberRepository(databaseService);
const organizationRepository = new SQLiteOrganizationRepository(
  databaseService,
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

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

const createGroupCommand = new CreateGroupCommand(groupRepository);
const updateGroupCommand = new UpdateGroupCommand(groupRepository);
const deleteGroupCommand = new DeleteGroupsCommand(
  groupRepository,
  groupMemberRepository,
);

const addMemberCommand = new AddMemberCommand(memberRepository);

const assignMembersToGroupCommand = new AssignMembersToGroupCommand(
  groupMemberRepository,
);
const removeMembersFromGroupCommand = new RemoveMembersFromGroupCommand(
  groupMemberRepository,
);

const assignGroupsToMemberCommand = new AssignGroupsToMemberCommand(
  groupMemberRepository,
);
const removeGroupsFromMemberCommand = new RemoveGroupsFromMemberCommand(
  groupMemberRepository,
);

//Queries
const findAllOrganizationsQuery = new FindAllOrganizationsQuery(
  databaseService,
);

const findAllMembersQuery = new FindAllMembersQuery(databaseService);

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
      delete: deleteGroupCommand,
      assignMembers: assignMembersToGroupCommand,
      removeMembers: removeMembersFromGroupCommand,
    },

    member: {
      add: addMemberCommand,
      assignGroups: assignGroupsToMemberCommand,
      removeGroups: removeGroupsFromMemberCommand,
    },
  },
  queries: {
    findAll: findAllOrganizationsQuery,

    members: { findAll: findAllMembersQuery },
  },
} as const;
