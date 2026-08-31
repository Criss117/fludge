import { hasPermissionProcedure } from "@fludge/api/index";
import { categoryContainer } from "@fludge/api/modules/catalog/categories/container";
import { createCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";
import { deleteCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/delete-category.command";
import { updateCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/update-category.command";

const TAGS = ["Categories"] as const;

export const categoryRouter = {
  queries: {
    findAll: hasPermissionProcedure({
      categories: ["read"],
    })
      .route({
        method: "GET",
        path: "/categories",
        tags: TAGS,
      })
      .handler(({ context }) =>
        categoryContainer.queries.findAll.execute(
          context.session.activeOrganization.id,
        ),
      ),
  },
  commands: {
    create: hasPermissionProcedure({
      categories: ["create"],
    })
      .route({
        method: "POST",
        path: "/categories",
        tags: TAGS,
      })
      .input(createCategoryCommand)
      .handler(({ input, context }) =>
        categoryContainer.commands.create.execute(
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      categories: ["update"],
    })
      .route({
        method: "PUT",
        path: "/categories",
        tags: TAGS,
      })
      .input(updateCategoryCommand)
      .handler(({ input, context }) =>
        categoryContainer.commands.update.execute(
          context.session.activeOrganization,
          input,
        ),
      ),

    delete: hasPermissionProcedure({
      categories: ["delete"],
    })
      .route({
        method: "DELETE",
        path: "/categories",
        tags: TAGS,
      })
      .input(deleteCategoryCommand)
      .handler(({ input, context }) =>
        categoryContainer.commands.delete.execute(
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
