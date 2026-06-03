import { authContainer } from "@fludge/api/modules/iam/auth/container";
import { SignUpEmployeeCommand } from "@fludge/api/modules/iam/employees/application/commands/sign-up-employee.command";

const signUpEmployeeCommand = new SignUpEmployeeCommand(
  authContainer.queries.emailsAlreadyExists,
);

export const employeesContainer = {
  commands: {
    signUpEmployee: signUpEmployeeCommand,
  },
  queries: {},
} as const;
