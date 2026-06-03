import { dbConnection } from "@fludge/db";
import { SignUpCommand } from "./application/commands/sign-up.command";
import { EmailsAlreadyExistsQuery } from "./application/queries/emails-already-exists.query";

const signUpEmailCommand = new SignUpCommand();

const emailsAlreadyExistsQuery = new EmailsAlreadyExistsQuery(dbConnection);

export const authContainer = {
  commands: {
    signUpEmail: signUpEmailCommand,
  },
  queries: {
    emailsAlreadyExists: emailsAlreadyExistsQuery,
  },
};
