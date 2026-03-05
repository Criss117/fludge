import { baseProcedure } from "@fludge/api";
import { withPermissionsMiddleware } from "@fludge/api/middlewares/with-permissions.middleware";
import {
  createCategorySchema,
  deleteCategoriesSchema,
  updateCategorySchema,
} from "@fludge/utils/validators/categories.validators";
import { createCategoryUseCase } from "./usecases/create-category.usecase";
import { findAllCategoriesUseCase } from "./usecases/find-all-categories.usecase";
import { deleteCategoriesUseCase } from "./usecases/delete-categories.usecase";
import { updateCategoryUseCase } from "./usecases/update-category.usecase";

export const categoriesProcedures = {
  create: baseProcedure({
    method: "POST",
    tags: ["categories"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["create:category"],
      }),
    )
    .input(createCategorySchema)
    .handler(({ input, context }) =>
      createCategoryUseCase.execute(context.organization.id, input),
    ),

  findAll: baseProcedure({
    method: "GET",
    tags: ["categories"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:category"],
      }),
    )
    .handler(({ context }) =>
      findAllCategoriesUseCase.execute(context.organization.id),
    ),

  delete: baseProcedure({
    method: "DELETE",
    tags: ["categories"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["delete:category"],
      }),
    )
    .input(deleteCategoriesSchema)
    .handler(({ input, context }) =>
      deleteCategoriesUseCase.execute(context.organization.id, input),
    ),

  update: baseProcedure({
    method: "PATCH",
    tags: ["categories"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["update:category"],
      }),
    )
    .input(updateCategorySchema)
    .handler(({ input, context }) =>
      updateCategoryUseCase.execute(context.organization.id, input),
    ),
};
