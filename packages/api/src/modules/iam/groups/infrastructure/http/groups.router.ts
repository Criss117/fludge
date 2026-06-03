import { protectedProcedure } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";
import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";

export const groupsRouter = {
  commands: {
    create: protectedProcedure
      .route({
        method: "POST",
        path: "/groups/create",
        tags: ["groups"],
      })
      .input(createGroupCommand)
      .handler(({ input }) =>
        groupsContainer.commands.createGroup.execute(input),
      ),
  },
  queries: {},
} as const;
