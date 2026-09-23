import { hasPermissionProcedure } from "@fludge/api/index";
import { createProductCommand } from "@core/catalog/products/application/commands/create-product.command";
import { updateProductCommand } from "@core/catalog/products/application/commands/update-product.command";
import { productContainer } from "@core/catalog/products/container";

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
        productContainer.commands.create.execute(
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
        productContainer.commands.update.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};