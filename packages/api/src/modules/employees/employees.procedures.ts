import { baseProcedure } from "@fludge/api";
import { findManyEmployeesUseCase } from "./usecases/find-many-employees.usecase";
import { createEmployeeUseCase } from "./usecases/create-employee.usecase";
import { signUpUsernameSchema } from "@fludge/utils/validators/auth.schemas";
import { withPermissionsMiddleware } from "@fludge/api/middlewares/with-permissions.middleware";

export const employeesProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Employees"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:employee"],
      }),
    )
    .handler(({ context }) =>
      findManyEmployeesUseCase.execute(context.organization.id),
    ),

  create: baseProcedure({
    tags: ["Employees"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:employee", "create:employee"],
      }),
    )
    .input(signUpUsernameSchema)
    .handler(({ context, input }) =>
      createEmployeeUseCase.execute(context.organization.id, input),
    ),
};
