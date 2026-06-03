import { withOrganization } from "@fludge/api/index";
import { signUpEmployeeCommand } from "@fludge/api/modules/iam/employees/application/commands/sign-up-employee.command";
import { employeesContainer } from "@fludge/api/modules/iam/employees/container";

export const employeeRouter = {
  commands: {
    signUpEmployee: withOrganization({
      requirePermission: "employees:create",
    })
      .route({
        method: "POST",
        path: "/employees/sign-up",
        tags: ["employees"],
      })
      .input(signUpEmployeeCommand)
      .handler(({ input, context }) =>
        employeesContainer.commands.signUpEmployee.execute(
          {
            ...input,
            organizationId: context.session.activeOrganization.id,
            memberId: context.session.member.id,
          },
          context.headers,
        ),
      ),
  },
  queries: {},
} as const;
