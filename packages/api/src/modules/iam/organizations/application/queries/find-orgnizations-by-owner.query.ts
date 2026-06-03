import { and, eq, getTableColumns } from "drizzle-orm";

import type { DbConnection } from "@fludge/db";
import { member, organization } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/client";

type Query = {
  userId: string;
};

export class FindOrganizationsByOwnerQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ userId }: Query) {
    const [orgs, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(organization),
        })
        .from(member)
        .innerJoin(organization, eq(organization.id, member.organizationId))
        .where(and(eq(member.userId, userId), eq(member.role, "owner"))),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return orgs;
  }
}
