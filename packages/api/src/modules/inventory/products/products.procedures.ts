import { baseProcedure } from "@fludge/api";
import {
  createProductSchema,
  updateProductSchema,
} from "@fludge/utils/validators/products.schemas";
import { createProductUseCase } from "./usecases/create-product.usecase";
import { findManyProductsUseCase } from "./usecases/find-many-products.usecase";
import { updateProductUseCase } from "./usecases/update-product.usecase";
import { withPermissionsMiddleware } from "@fludge/api/middlewares/with-permissions.middleware";

export const productsProcedures = {
  create: baseProcedure({
    method: "POST",
    tags: ["Inventory", "Products"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:product", "create:product"],
      }),
    )
    .input(createProductSchema)
    .handler(({ input, context }) =>
      createProductUseCase.execute(context.organization.id, input),
    ),

  update: baseProcedure({
    method: "PUT",
    tags: ["Inventory", "Products"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:product", "update:product"],
      }),
    )
    .input(updateProductSchema)
    .handler(({ input, context }) =>
      updateProductUseCase.execute(context.organization.id, input),
    ),

  findMany: baseProcedure({
    method: "GET",
    tags: ["Inventory", "Products"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:product"],
      }),
    )
    .handler(({ context }) =>
      findManyProductsUseCase.execute(context.organization.id),
    ),
};
