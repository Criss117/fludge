import { hasPermissionProcedure } from "@fludge/api/index";
import { productContainer } from "@fludge/api/modules/catalog/products/container";
import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";

const Tags = ["Products"];

export const productsRouter = {
  commands: {
    create: hasPermissionProcedure({
      members: ["create"],
    })
      .route({
        method: "POST",
        path: "/products",
        tags: Tags,
      })
      .input(createProductCommand)
      .handler(({ context, input }) =>
        productContainer.commands.create.execute(
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
