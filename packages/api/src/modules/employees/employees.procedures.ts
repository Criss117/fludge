import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { findManyEmployeesUseCase } from "./usecases/find-many-employees.usecase";
import { createEmployeeUseCase } from "./usecases/create-employee.usecase";

export const employeesProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) =>
      findManyEmployeesUseCase(context.req.headers).execute(),
    ),

  create: baseProcedure({
    tags: ["Employees"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) =>
      createEmployeeUseCase().execute(context.organization.id),
    ),
};
