import { auth } from "@fludge/auth";
import { UpdateUserInfoCommand } from "./application/commands/update-user-info.command";

//Commands
// const signUpMemberCommand = new SignUpMemberCommand(
//   auth,
//   organizationContainer.commands.member.add,
// );

const updateUserInfoCommand = new UpdateUserInfoCommand(auth);

export const authContainer = {
  commands: {
    // signUpMember: signUpMemberCommand,
    updateUserInfo: updateUserInfoCommand,
  },
} as const;
