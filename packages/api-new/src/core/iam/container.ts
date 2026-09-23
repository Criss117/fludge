import { databaseService } from "@fludge/db";

import { AssignGroupsToMemberCommand } from "./application/commands/assign-groups-to-member.command";
import { AssignMembersToGroupCommand } from "./application/commands/assign-members-to-group.command";
import { CreateGroupCommand } from "./application/commands/create-group.command";
import { DeleteGroupsCommand } from "./application/commands/delete-groups.command";
import { RegisterOrganizationCommand } from "./application/commands/register-organization.command";
import { RemoveGroupsFromMemberCommand } from "./application/commands/remove-groups-from-member.command";
import { RemoveMembersFromGroupCommand } from "./application/commands/remove-members-from-group.command";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { UpdateOrganizationCommand } from "./application/commands/update-organization.command";
import { GroupUniquenessValidator } from "./application/services/group-uniqueness-validator.service";
import { OrganizationUniquenessValidator } from "./application/services/organization-uniqueness-validator.service";
import { UserAuthContextService } from "./application/services/user-auth-context.service";
import { SQLiteGroupMemberRepository } from "./infrastructure/repositories/sqlite-group-member-repository";
import { SQLiteGroupRepository } from "./infrastructure/repositories/sqlite-group-repository";
import { SQLiteMemberRepository } from "./infrastructure/repositories/sqlite-member-repository";
import { SQLiteOrganizationRepository } from "./infrastructure/repositories/sqlite-organization.repository";

//Repositories
const memberRepository = new SQLiteMemberRepository(databaseService);
const groupRepository = new SQLiteGroupRepository(databaseService);
const groupMemberRepository = new SQLiteGroupMemberRepository(databaseService);
const organizationRepository = new SQLiteOrganizationRepository(
  databaseService,
);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);
const groupUniquenessValidator = new GroupUniquenessValidator(databaseService);
const userAuthContextService = new UserAuthContextService(
  databaseService,
  memberRepository,
);

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
);

const updateGroupCommand = new UpdateGroupCommand(
  groupUniquenessValidator,
  groupRepository,
);

const deleteGroupsCommand = new DeleteGroupsCommand(
  groupRepository,
  groupMemberRepository,
);

const assignMembersToGroupCommand = new AssignMembersToGroupCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

const removeMembersFromGroupCommand = new RemoveMembersFromGroupCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

const assignGroupsToMemberCommand = new AssignGroupsToMemberCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

const removeGroupsFromMemberCommand = new RemoveGroupsFromMemberCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

export const organizationContainer = {
  repositories: { organizationRepository },
  services: {
    organizationUniquenessValidator,
    groupUniquenessValidator,
    userAuthContextService,
  },
  commands: {
    register: registerOrganizationCommand,
    update: updateOrganizationCommand,
    group: {
      create: createGroupCommand,
      update: updateGroupCommand,
      delete: deleteGroupsCommand,
      assignMembers: assignMembersToGroupCommand,
      removeMembers: removeMembersFromGroupCommand,
    },
    member: {
      assignGroups: assignGroupsToMemberCommand,
      removeGroups: removeGroupsFromMemberCommand,
    },
  },
} as const;
