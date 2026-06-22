import { dbConnection } from "@fludge/db";

import { authContainer } from "@fludge/api/modules/iam/auth/container";

import { RegisterMemberCommand } from "@fludge/api/modules/iam/members/application/commands/register-member.command";
import { FindAllMembersQuery } from "./application/queries/find-all-members.query";
import { FindMeQuery } from "./application/queries/find-me.query";

// Repositories

// Commands
const registerMemberCommand = new RegisterMemberCommand(
  authContainer.queries.emailsAlreadyExists,
);

// Queries
const findAllMembersQuery = new FindAllMembersQuery(dbConnection);
const findMeQuery = new FindMeQuery(dbConnection);

export const membersContainer = {
  commands: {
    register: registerMemberCommand,
  },
  queries: {
    findAll: findAllMembersQuery,
    me: findMeQuery,
  },
} as const;
