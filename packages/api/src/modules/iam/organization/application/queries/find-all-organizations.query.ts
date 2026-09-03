import { desc, eq, getColumns } from "drizzle-orm";

import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export class FindAllOrganizationsQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(loggedUserId: string) {
    const [allOrganizations, errorFindingOrganizations] = await tryCatch(
      this.db
        .select(getColumns(organization))
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(eq(member.userId, loggedUserId))
        .orderBy(desc(organization.createdAt))
        .groupBy(organization.id),
    );

    if (errorFindingOrganizations)
      throw new InternalServerError(
        errorFindingOrganizations,
        "iam.organizations.errors.isr_on_find",
      );

    return allOrganizations;
  }
}
