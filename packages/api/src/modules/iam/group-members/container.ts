import { dbConnection } from "@fludge/db";
import { FindAllGroupMembersQuery } from "./application/queries/find-all-group-members.query";
import { AssignMembersCommand } from "./application/commands/assign-members.command";
import { UnAssignMembersCommand } from "./application/commands/unassign-members.command";
import { organizationsContainer } from "@fludge/api/modules/iam/organizations/container";
import { PgGroupMemberRepository } from "./infrastructure/repositories/pg-group-member.repository";

// Repositories
const groupMemberRepository = new PgGroupMemberRepository(dbConnection);

// Queries
const findAllGroupMembersQuery = new FindAllGroupMembersQuery(dbConnection);

// Commands
const assignMembersCommand = new AssignMembersCommand(
  groupMemberRepository,
  organizationsContainer.services.organizationHas,
);
const unassignMembersCommand = new UnAssignMembersCommand(
  groupMemberRepository,
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
