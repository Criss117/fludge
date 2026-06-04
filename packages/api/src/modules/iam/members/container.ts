import { authContainer } from "@fludge/api/modules/iam/auth/container";
import { SignUpMemberCommand } from "@fludge/api/modules/iam/members/application/commands/sign-up-member.command";

const signUpMemberCommand = new SignUpMemberCommand(
  authContainer.queries.emailsAlreadyExists,
);

export const membersContainer = {
  commands: {
    signUpMember: signUpMemberCommand,
  },
  queries: {},
} as const;
