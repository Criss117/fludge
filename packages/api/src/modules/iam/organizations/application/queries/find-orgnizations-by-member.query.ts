import { and, eq, getTableColumns, SQL } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { member, organization } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  userId: string;
  options?: {
    filterBy?: "owner" | "member";
  };
};

export class FindOrganizationsByMemberQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ userId, options }: Query) {
    const where: SQL[] = [eq(member.userId, userId)];

    if (options?.filterBy === "owner") {
      where.push(eq(member.role, "owner"));
    } else if (options?.filterBy === "member") {
      where.push(eq(member.role, "member"));
    }

    const [orgs, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(organization),
        })
        .from(member)
        .innerJoin(organization, eq(organization.id, member.organizationId))
        .where(and(...where)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return orgs;
  }
}
