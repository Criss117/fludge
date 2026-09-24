import { syncIamQuery } from "@fludge/api/core/iam/application/queries/sync-iam.query";
import { iamContainer } from "@fludge/api/core/iam/container";
import { catalogContainer } from "@fludge/api/core/catalog/container";
import { syncCatalogQuery } from "@fludge/api/core/catalog/products/application/queries/sync-catalog.query";
import { withOrganizationIdsProcedure } from "..";

const TAGS = ["Sync"] as const;

export const syncRouter = {
  syncIam: withOrganizationIdsProcedure
    .route({
      method: "POST",
      path: "/sync-iam",
      tags: TAGS,
    })
    .input(syncIamQuery)
    .handler(({ input, context }) =>
      iamContainer.queries.syncIam.execute(
        context.session.organizationIds,
        input,
      ),
    ),

  syncCatalog: withOrganizationIdsProcedure
    .route({
      method: "POST",
      path: "/sync-catalog",
      tags: TAGS,
    })
    .input(syncCatalogQuery)
    .handler(({ input, context }) =>
      catalogContainer.queries.syncCatalogQuery.execute(
        context.session.organizationIds,
        input,
      ),
    ),
};
