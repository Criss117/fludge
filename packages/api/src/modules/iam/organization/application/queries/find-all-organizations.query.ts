import { desc, eq, getColumns } from "drizzle-orm";

import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";

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
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener organizaciones",
        cause: errorFindingOrganizations.cause,
      });

    return allOrganizations;
  }
}
