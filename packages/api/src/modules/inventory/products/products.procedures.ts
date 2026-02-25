import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { createProductSchema } from "@fludge/utils/validators/products.schemas";
import { createProductUseCase } from "./usecases/create-product.usecase";
import { findManyProductsUseCase } from "./usecases/find-many-products.usecase";
import { paginatedValidator } from "@fludge/utils/validators/utils";

export const productsProcedures = {
  create: baseProcedure({
    method: "POST",
    tags: ["Inventory", "Products"],
  })
    .use(withOrganizationMiddleware())
    .input(createProductSchema)
    .handler(({ input, context }) =>
      createProductUseCase.execute(context.organization.id, input),
    ),

  findMany: baseProcedure({
    method: "GET",
    tags: ["Inventory", "Products"],
  })
    .use(withOrganizationMiddleware())
    .input(paginatedValidator)
    .handler(({ context, input }) =>
      findManyProductsUseCase.execute(context.organization.id, input),
    ),
};
