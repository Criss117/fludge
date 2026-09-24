import { hasPermissionProcedure } from "@fludge/api/index";
import { createCategoryCommand } from "@fludge/api/core/catalog/categories/application/commands/create-category.command";
import { updateCategoryCommand } from "@fludge/api/core/catalog/categories/application/commands/update-category.command";
import { toggleCategoryStatusCommand } from "@fludge/api/core/catalog/categories/application/commands/toggle-category-status.command";
import { catalogContainer } from "@fludge/api/core/catalog/container";

const TAGS = ["Categories"] as const;

export const categoryRouter = {
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
        catalogContainer.commands.createCategoryCommand.execute(
          context.session.authContext,
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
        catalogContainer.commands.updateCategoryCommand.execute(
          context.session.authContext,
          input,
        ),
      ),

    toggleStatus: hasPermissionProcedure({
      categories: ["update"],
    })
      .route({
        method: "PATCH",
        path: "/categories/toggle-status",
        tags: TAGS,
      })
      .input(toggleCategoryStatusCommand)
      .handler(({ input, context }) =>
        catalogContainer.commands.toggleCategoryStatusCommand.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
