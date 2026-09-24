import { syncIamQuery } from "@fludge/api/core/iam/application/queries/sync-iam.query";
import { iamContainer } from "@fludge/api/core/iam/container";
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
};
