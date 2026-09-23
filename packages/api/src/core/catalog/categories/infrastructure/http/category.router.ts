import { hasPermissionProcedure } from "@fludge/api/index";
import { createCategoryCommand } from "@core/catalog/categories/application/commands/create-category.command";
import { updateCategoryCommand } from "@core/catalog/categories/application/commands/update-category.command";
import { toggleCategoryStatusCommand } from "@core/catalog/categories/application/commands/toggle-category-status.command";
import { categoryContainer } from "@core/catalog/categories/container";

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
        categoryContainer.commands.create.execute(
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
        categoryContainer.commands.update.execute(
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
        categoryContainer.commands.toggleStatus.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
