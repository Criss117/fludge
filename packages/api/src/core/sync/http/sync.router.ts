import { withOrganizationIdsProcedure } from "@fludge/api/index";
import { syncContainer } from "../container";
import { syncCommerceQuery } from "../queries/sync-sale.query";
import { syncCatalogQuery } from "../queries/sync-catalog.query";
import { syncIamQuery } from "../queries/sync-iam.query";

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
      syncContainer.queries.syncIam.execute(
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
      syncContainer.queries.syncCatalog.execute(
        context.session.organizationIds,
        input,
      ),
    ),

  syncCommerce: withOrganizationIdsProcedure
    .route({
      method: "POST",
      path: "/sync-commerce",
      tags: TAGS,
    })
    .input(syncCommerceQuery)
    .handler(({ input, context }) =>
      syncContainer.queries.syncCommerce.execute(
        context.session.organizationIds,
        input,
      ),
    ),
};
