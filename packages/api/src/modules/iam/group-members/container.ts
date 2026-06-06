import { dbConnection } from "@fludge/db";
import { FindAllGroupMembersQuery } from "./application/queries/find-all-group-members.query";
import { AssignMembersCommand } from "./application/commands/assign-members.command";
import { UnAssignMembersCommand } from "./application/commands/unassign-members.command";
import { organizationsContainer } from "../organizations/container";
import { PgGroupMembersCommandsRepository } from "./infrastructure/repositories/pg-group-members-commands.repository";

// Repositories
const groupMembersCommandsRepository = new PgGroupMembersCommandsRepository(
  dbConnection,
);

// Queries
const findAllGroupMembersQuery = new FindAllGroupMembersQuery(dbConnection);

// Commands
const assignMembersCommand = new AssignMembersCommand(
  organizationsContainer.queries.organizationHasMembers,
  organizationsContainer.queries.organizationHasGroups,
  groupMembersCommandsRepository,
);
const unassignMembersCommand = new UnAssignMembersCommand(
  groupMembersCommandsRepository,
);

export const groupMembersContainer = {
  commands: {
    assignMembers: assignMembersCommand,
    unassignMembers: unassignMembersCommand,
  },
  queries: {
    findAll: findAllGroupMembersQuery,
  },
} as const;
