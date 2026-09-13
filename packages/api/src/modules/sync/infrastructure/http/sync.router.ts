import { protectedProcedure } from "@fludge/api/index";
import { findSyncIamQuery } from "@fludge/api/modules/sync/application/queries/find-sync-iam.query";
import { syncContainer } from "@fludge/api/modules/sync/container";

const TAGS = ["Sync"];

export const syncRouter = {
  iam: {
    find: protectedProcedure
      .route({
        path: "/sync/iam",
        method: "POST",
        tags: TAGS,
      })
      .input(findSyncIamQuery)
      .handler(({ context, input }) =>
        syncContainer.queries.findSyncIamQuery.execute(
          context.session.userId,
          input,
        ),
      ),
  },
};
