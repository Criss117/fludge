import { auth } from "@fludge/auth";
import { iamContainer } from "../iam/container";
import { SignUpMemberCommand } from "./application/commands/sign-up-member.command";
import { UpdateUserInfoCommand } from "./application/commands/update-user-info.command";

//Commands
const signUpMemberCommand = new SignUpMemberCommand(
  auth,
  iamContainer.commands.member.add,
);

const updateUserInfoCommand = new UpdateUserInfoCommand(auth);

export const authContainer = {
  commands: {
    signUpMember: signUpMemberCommand,
    updateUserInfo: updateUserInfoCommand,
  },
} as const;
