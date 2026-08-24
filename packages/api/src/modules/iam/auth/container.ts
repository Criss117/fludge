import { databaseService } from "@fludge/db";
import { SetActiveOrganizationCommand } from "./application/commands/set-active-organization.command";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";
import { SignUpMemberCommand } from "./application/commands/sign-up-member.command";
import { auth } from "@fludge/auth";
import { UpdateUserInfoCommand } from "./application/commands/update-user-info.command";

//Commands
const setActiveOrganizationCommand = new SetActiveOrganizationCommand(
  organizationContainer.services.ensureOrganizationExistsService,
  databaseService,
);

const signUpMemberCommand = new SignUpMemberCommand(
  auth,
  organizationContainer.commands.member.add,
);

const updateUserInfoCommand = new UpdateUserInfoCommand(auth);

export const authContainer = {
  commands: {
    setActiveOrganization: setActiveOrganizationCommand,
    signUpMember: signUpMemberCommand,
    updateUserInfo: updateUserInfoCommand,
  },
} as const;
