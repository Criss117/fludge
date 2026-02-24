import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { findManyEmployeesUseCase } from "./usecases/find-many-employees.usecase";
import { createEmployeeUseCase } from "./usecases/create-employee.usecase";
import { signUpUsernameSchema } from "@fludge/utils/validators/auth.schemas";
import { assignTeamsToEmployeeSchema } from "@fludge/utils/validators/employees.schemas";
import { assignTeamsToEmployeeUseCase } from "./usecases/assign-teams-to-employee.usecase";
import { removeTeamsFromEmployeeUseCase } from "./usecases/remove-teams-from-employee.usecase";

export const employeesProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) =>
      findManyEmployeesUseCase.execute(context.organization.id),
    ),

  create: baseProcedure({
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .input(signUpUsernameSchema)
    .handler(({ context, input }) =>
      createEmployeeUseCase.execute(context.organization.id, input),
    ),

  assignTeams: baseProcedure({
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .input(assignTeamsToEmployeeSchema)
    .handler(({ context, input }) =>
      assignTeamsToEmployeeUseCase(context.req.headers).execute(input),
    ),

  removeTeams: baseProcedure({
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .input(assignTeamsToEmployeeSchema)
    .handler(({ context, input }) =>
      removeTeamsFromEmployeeUseCase(context.req.headers).execute(input),
    ),
};
