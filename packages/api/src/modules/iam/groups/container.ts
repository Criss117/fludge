import { dbConnection } from "@fludge/db";

import { eventBus } from "@fludge/api/modules/shared/domain/event-bus";

import { organizationsContainer } from "@fludge/api/modules/iam/organizations/container";

import { CreateGroupCommand } from "./application/commands/create-group.command";
import { PGGroupsCommandsRepository } from "./infrastructure/repositories/pg-groups-commands.repository";
import { FindAllGroupsByMemberQuery } from "./application/queries/find-all-groups-by-member.query";
import { UpdateGroupCommand } from "./application/commands/update-group.command";
import { DeleteGroupsCommand } from "./application/commands/delete-groups.command";
import { ActivateGroupsCommand } from "./application/commands/activate-groups.command";
import { DeactivateGroupsCommand } from "./application/commands/deactivate-groups.command";
import { AssignMembersToGroupCommand } from "./application/commands/assign-members-to-group.command";
import { UnAssignMembersToGroupCommand } from "./application/commands/unassign-members-to-group.command";
import { FindAllGroupsQuery } from "./application/queries/find-all-groups.query";

// Repositories
const groupsCommandsRepository = new PGGroupsCommandsRepository(dbConnection);

// Commands
const createGroupCommand = new CreateGroupCommand(
  eventBus,
  groupsCommandsRepository,
);
const updateGroupCommand = new UpdateGroupCommand(groupsCommandsRepository);
const deleteGroupCommand = new DeleteGroupsCommand(groupsCommandsRepository);
const activateGroupCommand = new ActivateGroupsCommand(
  groupsCommandsRepository,
);
const deactivateGroupCommand = new DeactivateGroupsCommand(
  groupsCommandsRepository,
);
const assignMembersToGroupCommand = new AssignMembersToGroupCommand(
  organizationsContainer.queries.organizationHasMembers,
  groupsCommandsRepository,
);
const unassignMembersToGroupCommand = new UnAssignMembersToGroupCommand(
  organizationsContainer.queries.organizationHasMembers,
  groupsCommandsRepository,
);

// Queries
const findAllGroupsByMemberQuery = new FindAllGroupsByMemberQuery(dbConnection);
const findAllGroupsQuery = new FindAllGroupsQuery(dbConnection);

export const groupsContainer = {
  commands: {
    create: createGroupCommand,
    update: updateGroupCommand,
    delete: deleteGroupCommand,
    activate: activateGroupCommand,
    deactivate: deactivateGroupCommand,
    assignMembers: assignMembersToGroupCommand,
    unassignMembers: unassignMembersToGroupCommand,
  },
  queries: {
    findAllByMember: findAllGroupsByMemberQuery,
    findAll: findAllGroupsQuery,
  },
} as const;
