import { eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllGroupMembersQuery {
  constructor(public readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({ ...getTableColumns(groupMember) })
        .from(groupMember)
        .innerJoin(group, eq(group.id, groupMember.groupId))
        .where(eq(group.organizationId, query.organizationId)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return data;
  }
}
