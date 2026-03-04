import { baseProcedure } from "@fludge/api";
import {
  createProductSchema,
  deleteProductsSchema,
  updateProductSchema,
} from "@fludge/utils/validators/products.schemas";
import { createProductUseCase } from "./usecases/create-product.usecase";
import { findManyProductsUseCase } from "./usecases/find-many-products.usecase";
import { updateProductUseCase } from "./usecases/update-product.usecase";
import { withPermissionsMiddleware } from "@fludge/api/middlewares/with-permissions.middleware";
import { deleteProductsUseCase } from "./usecases/delete-products.usecase";
import { toggleProductDisabledUseCase } from "./usecases/toggle-product-disabled.usecase";

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

  delete: baseProcedure({
    method: "DELETE",
    tags: ["Inventory", "Products"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:product", "delete:product"],
      }),
    )
    .input(deleteProductsSchema)
    .handler(({ input, context }) =>
      deleteProductsUseCase.execute(context.organization.id, input),
    ),

  toggleDisabled: baseProcedure({
    method: "PUT",
    tags: ["Inventory", "Products"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:product", "update:product"],
      }),
    )
    .input(deleteProductsSchema)
    .handler(({ input, context }) =>
      toggleProductDisabledUseCase.execute(context.organization.id, input),
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
