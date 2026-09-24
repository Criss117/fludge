import { databaseService } from "@fludge/db";

import { AddMemberCommand } from "./application/commands/add-member.command";
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
import { UserOrganizationIdsService } from "./application/services/user-organization-ids.service";
import { SQLiteGroupMemberRepository } from "./infrastructure/repositories/sqlite-group-member-repository";
import { SQLiteGroupRepository } from "./infrastructure/repositories/sqlite-group-repository";
import { SQLiteMemberRepository } from "./infrastructure/repositories/sqlite-member-repository";
import { SQLiteOrganizationRepository } from "./infrastructure/repositories/sqlite-organization.repository";
import { SyncIamQuery } from "./application/queries/sync-iam.query";
import { SQLiteSyncIamRepository } from "./infrastructure/repositories/sqlite-sync-iam.repository";

//Repositories
const memberRepository = new SQLiteMemberRepository(databaseService);
const groupMemberRepository = new SQLiteGroupMemberRepository(databaseService);
const groupRepository = new SQLiteGroupRepository(
  databaseService,
  groupMemberRepository,
);
const organizationRepository = new SQLiteOrganizationRepository(
  databaseService,
);
const syncIamRepository = new SQLiteSyncIamRepository(databaseService);

//Services
const organizationUniquenessValidator = new OrganizationUniquenessValidator(
  databaseService,
);
const groupUniquenessValidator = new GroupUniquenessValidator(databaseService);
const userAuthContextService = new UserAuthContextService(
  databaseService,
  memberRepository,
);
const userOrganizationIdsService = new UserOrganizationIdsService(
  databaseService,
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

const deleteGroupsCommand = new DeleteGroupsCommand(groupRepository);

const assignMembersToGroupCommand = new AssignMembersToGroupCommand(
  groupRepository,
  memberRepository,
);

const removeMembersFromGroupCommand = new RemoveMembersFromGroupCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

const assignGroupsToMemberCommand = new AssignGroupsToMemberCommand(
  groupRepository,
  memberRepository,
);

const removeGroupsFromMemberCommand = new RemoveGroupsFromMemberCommand(
  groupRepository,
  memberRepository,
  groupMemberRepository,
);

const addMemberCommand = new AddMemberCommand(memberRepository);

//Queries
const syncIamQuery = new SyncIamQuery(syncIamRepository);

export const iamContainer = {
  repositories: {
    organizationRepository,
    memberRepository,
    groupRepository,
    syncIamRepository,
  },
  services: {
    organizationUniquenessValidator,
    groupUniquenessValidator,
    userAuthContextService,
    userOrganizationIdsService,
  },
  commands: {
    organization: {
      register: registerOrganizationCommand,
      update: updateOrganizationCommand,
    },
    group: {
      create: createGroupCommand,
      update: updateGroupCommand,
      delete: deleteGroupsCommand,
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
    syncIam: syncIamQuery,
  },
} as const;
