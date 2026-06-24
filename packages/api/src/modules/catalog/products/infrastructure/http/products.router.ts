import { withOrganization } from "@fludge/api/index";
import { productsContainer } from "@fludge/api/modules/catalog/products/container";

import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";
import { updateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/update-product.command";
import { deleteProductCommand } from "@fludge/api/modules/catalog/products/application/commands/delete-product.command";

const TAGS = ["Products"] as const;

export const productsRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "products:create",
    })
      .route({
        method: "POST",
        path: "/products",
        tags: TAGS,
      })
      .input(createProductCommand)
      .handler(({ input, context }) =>
        productsContainer.commands.create.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          createdBy: context.session.member.id,
        }),
      ),

    update: withOrganization({
      requirePermission: "products:update",
    })
      .route({
        method: "PATCH",
        path: "/products",
        tags: TAGS,
      })
      .input(updateProductCommand)
      .handler(({ input, context }) =>
        productsContainer.commands.update.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    delete: withOrganization({
      requirePermission: "products:delete",
    })
      .route({
        method: "DELETE",
        path: "/products",
        tags: TAGS,
      })
      .input(deleteProductCommand)
      .handler(({ input, context }) =>
        productsContainer.commands.delete.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
  queries: {
    findAll: withOrganization({
      requirePermission: "products:view",
    })
      .route({
        method: "GET",
        path: "/products",
        tags: TAGS,
      })
      .handler(({ context }) =>
        productsContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;