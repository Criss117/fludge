import { SignUpCommand } from "./application/commands/sign-up.command";

const signUpEmailCommand = new SignUpCommand();

export const authContainer = {
  commands: {
    signUpEmail: signUpEmailCommand,
  },
};
