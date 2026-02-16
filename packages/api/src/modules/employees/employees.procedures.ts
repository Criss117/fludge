import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { findManyEmployeesUseCase } from "./usecases/find-many-employees.usecase";
import { createEmployeeUseCase } from "./usecases/create-employee.usecase";
import { signUpUsernameSchema } from "@fludge/utils/validators/auth.schemas";

export const employeesProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) =>
      findManyEmployeesUseCase().execute(context.organization.id),
    ),

  create: baseProcedure({
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .input(signUpUsernameSchema)
    .handler(({ context, input }) =>
      createEmployeeUseCase().execute(context.organization.id, input),
    ),
};
