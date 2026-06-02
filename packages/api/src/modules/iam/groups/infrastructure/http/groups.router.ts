import { protectedProcedure } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";

export const groupsRouter = {
  commands: {
    create: protectedProcedure
      .route({
        method: "POST",
        path: "/groups/create",
        tags: ["groups"],
      })
      .handler(() => groupsContainer.commands.createGroup.execute()),
  },
  queries: {},
} as const;
