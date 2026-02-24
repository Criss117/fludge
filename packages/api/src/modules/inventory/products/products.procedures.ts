import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { createProductSchema } from "@fludge/utils/validators/products.schemas";
import { createProductUseCase } from "./usecases/create-product.usecase";

export const productsProcedures = {
  create: baseProcedure({
    method: "POST",
    tags: ["Inventory", "Products"],
  })
    .use(withOrganizationMiddleware())
    .input(createProductSchema)
    .handler(({ input, context }) =>
      createProductUseCase().execute(context.organization.id, input),
    ),
};
