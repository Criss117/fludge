import { withOrganization } from "@fludge/api/index";
import { categoriesContainer } from "@fludge/api/modules/catalog/categories/container";

import { createCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";
import { updateCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/update-category.command";
import { deleteCategoriesCommand } from "@fludge/api/modules/catalog/categories/application/commands/delete-categories.command";
import { activateCategoriesCommand } from "@fludge/api/modules/catalog/categories/application/commands/delete-categories.command";
import { deactivateCategoriesCommand } from "@fludge/api/modules/catalog/categories/application/commands/delete-categories.command";

const TAGS = ["Categories"] as const;

export const categoriesRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "categories:create",
    })
      .route({
        method: "POST",
        path: "/categories",
        tags: TAGS,
      })
      .input(createCategoryCommand)
      .handler(({ input, context }) =>
        categoriesContainer.commands.create.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          createdBy: context.session.member.id,
        }),
      ),

    update: withOrganization({
      requirePermission: "categories:update",
    })
      .route({
        method: "PATCH",
        path: "/categories",
        tags: TAGS,
      })
      .input(updateCategoryCommand)
      .handler(({ input, context }) =>
        categoriesContainer.commands.update.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    delete: withOrganization({
      requirePermission: "categories:delete",
    })
      .route({
        method: "DELETE",
        path: "/categories",
        tags: TAGS,
      })
      .input(deleteCategoriesCommand)
      .handler(({ input, context }) =>
        categoriesContainer.commands.delete.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    activate: withOrganization({
      requirePermission: "categories:update",
    })
      .route({
        method: "PATCH",
        path: "/categories/activate",
        tags: TAGS,
      })
      .input(activateCategoriesCommand)
      .handler(({ input, context }) =>
        categoriesContainer.commands.activate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    deactivate: withOrganization({
      requirePermission: "categories:update",
    })
      .route({
        method: "PATCH",
        path: "/categories/deactivate",
        tags: TAGS,
      })
      .input(deactivateCategoriesCommand)
      .handler(({ input, context }) =>
        categoriesContainer.commands.deactivate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
  queries: {
    findAll: withOrganization({
      requirePermission: "categories:view",
    })
      .route({
        method: "GET",
        path: "/categories",
        tags: TAGS,
      })
      .handler(({ context }) =>
        categoriesContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;