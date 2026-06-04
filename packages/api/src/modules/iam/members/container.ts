import { dbConnection } from "@fludge/db";

import { authContainer } from "@fludge/api/modules/iam/auth/container";

import { SignUpMemberCommand } from "@fludge/api/modules/iam/members/application/commands/sign-up-member.command";
import { FindAllMembersQuery } from "./application/queries/find-all-members.query";

// Commands
const signUpMemberCommand = new SignUpMemberCommand(
  authContainer.queries.emailsAlreadyExists,
);

// Queries
const findAllMembersQuery = new FindAllMembersQuery(dbConnection);

export const membersContainer = {
  commands: {
    signUpMember: signUpMemberCommand,
  },
  queries: {
    findAll: findAllMembersQuery,
  },
} as const;
