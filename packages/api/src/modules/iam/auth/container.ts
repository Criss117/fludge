import { databaseService } from "@fludge/db";
import { SetActiveOrganizationCommand } from "./application/commands/set-active-organization.command";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";
import { SignUpMemberCommand } from "./application/commands/sign-up-member.command";
import { auth } from "@fludge/auth";

const setActiveOrganizationCommand = new SetActiveOrganizationCommand(
  organizationContainer.services.ensureOrganizationExistsService,
  databaseService,
);

const signUpMemberCommand = new SignUpMemberCommand(
  auth,
  organizationContainer.commands.member.add,
);

export const authContainer = {
  commands: {
    setActiveOrganization: setActiveOrganizationCommand,
    signUpMember: signUpMemberCommand,
  },
} as const;
