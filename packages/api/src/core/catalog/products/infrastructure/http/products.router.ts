import { hasPermissionProcedure } from "@fludge/api/index";
import { createProductCommand } from "@fludge/api/core/catalog/products/application/commands/create-product.command";
import { updateProductCommand } from "@fludge/api/core/catalog/products/application/commands/update-product.command";
import { catalogContainer } from "@fludge/api/core/catalog/container";

const TAGS = ["Products"] as const;

export const productsRouter = {
  commands: {
    create: hasPermissionProcedure({
      products: ["create"],
    })
      .route({
        method: "POST",
        path: "/products",
        tags: TAGS,
      })
      .input(createProductCommand)
      .handler(({ input, context }) =>
        catalogContainer.commands.createProductCommand.execute(
          context.session.authContext,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      products: ["update"],
    })
      .route({
        method: "PUT",
        path: "/products",
        tags: TAGS,
      })
      .input(updateProductCommand)
      .handler(({ input, context }) =>
        catalogContainer.commands.updateProductCommand.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
