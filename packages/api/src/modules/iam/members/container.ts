import { dbConnection } from "@fludge/db";

import { authContainer } from "@fludge/api/modules/iam/auth/container";

import { SignUpMemberCommand } from "@fludge/api/modules/iam/members/application/commands/sign-up-member.command";
import { FindAllMembersQuery } from "./application/queries/find-all-members.query";
import { AssignGroupsToMemberCommand } from "./application/commands/assign-groups-to-member.command";
import { UnAssignGroupsOfMemberCommand } from "./application/commands/unassign-groups-of-member.command";
import { PGMembersCommandsRepository } from "./infrastructure/repositories/pg-members-commands.repository";
import { organizationsContainer } from "../organizations/container";

// Repositories
const membersCommandsRepository = new PGMembersCommandsRepository(dbConnection);

// Commands
const assignGroupsToMemberCommand = new AssignGroupsToMemberCommand(
  membersCommandsRepository,
  organizationsContainer.queries.organizationHasGroups,
);

const unassignGroupsOfMemberCommand = new UnAssignGroupsOfMemberCommand(
  membersCommandsRepository,
);
const signUpMemberCommand = new SignUpMemberCommand(
  authContainer.queries.emailsAlreadyExists,
);

// Queries
const findAllMembersQuery = new FindAllMembersQuery(dbConnection);

export const membersContainer = {
  commands: {
    signUpMember: signUpMemberCommand,
    assignGroups: assignGroupsToMemberCommand,
    unassignGroups: unassignGroupsOfMemberCommand,
  },
  queries: {
    findAll: findAllMembersQuery,
  },
} as const;
