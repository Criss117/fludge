import { protectedProcedure } from "@fludge/api/index";
import { syncContainer } from "@fludge/api/modules/sync/container";
import { findSyncIamQuery } from "@fludge/api/modules/sync/application/queries/find-sync-iam.query";
import { findSyncCatalogQuery } from "@fludge/api/modules/sync/application/queries/find-sync-catalog.query";

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
  catalog: {
    find: protectedProcedure
      .route({
        path: "/sync/catalog",
        method: "POST",
        tags: TAGS,
      })
      .input(findSyncCatalogQuery)
      .handler(({ context, input }) =>
        syncContainer.queries.findSyncCatalogQuery.execute(
          context.session.userId,
          input,
        ),
      ),
  },
};
