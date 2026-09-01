import { hasPermissionProcedure } from "@fludge/api/index";
import { productContainer } from "@fludge/api/modules/catalog/products/container";
import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";
import { updateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/update-product.command";
import { deleteProductCommand } from "@fludge/api/modules/catalog/products/application/commands/delete-product.command";

const Tags = ["Products"];

export const productsRouter = {
  commands: {
    create: hasPermissionProcedure({
      products: ["create"],
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

    update: hasPermissionProcedure({
      products: ["update"],
    })
      .route({
        method: "PATCH",
        path: "/products",
        tags: Tags,
      })
      .input(updateProductCommand)
      .handler(({ context, input }) =>
        productContainer.commands.update.execute(
          context.session.activeOrganization,
          input,
        ),
      ),

    delete: hasPermissionProcedure({
      products: ["delete"],
    })
      .route({
        method: "DELETE",
        path: "/products",
        tags: Tags,
      })
      .input(deleteProductCommand)
      .handler(({ context, input }) =>
        productContainer.commands.delete.execute(
          context.session.activeOrganization.id.toString(),
          input,
        ),
      ),
  },
  queries: {
    findAll: hasPermissionProcedure({
      products: ["read"],
    })
      .route({
        method: "GET",
        path: "/products",
        tags: Tags,
      })
      .handler(({ context }) =>
        productContainer.queries.findAll.execute(
          context.session.activeOrganization.id.toString(),
        ),
      ),
  },
};
