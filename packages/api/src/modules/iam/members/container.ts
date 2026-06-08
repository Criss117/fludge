import { dbConnection } from "@fludge/db";

import { authContainer } from "@fludge/api/modules/iam/auth/container";

import { RegisterMemberCommand } from "@fludge/api/modules/iam/members/application/commands/register-member.command";
import { FindAllMembersQuery } from "./application/queries/find-all-members.query";

// Repositories

// Commands
const registerMemberCommand = new RegisterMemberCommand(
  authContainer.queries.emailsAlreadyExists,
);

// Queries
const findAllMembersQuery = new FindAllMembersQuery(dbConnection);

export const membersContainer = {
  commands: {
    register: registerMemberCommand,
  },
  queries: {
    findAll: findAllMembersQuery,
  },
} as const;
