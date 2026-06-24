import { withOrganization } from "@fludge/api/index";
import { productsContainer } from "@fludge/api/modules/catalog/products/container";

import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";

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
  },
} as const;