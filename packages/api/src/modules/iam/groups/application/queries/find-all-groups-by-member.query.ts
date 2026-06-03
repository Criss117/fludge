import { ORPCError } from "@orpc/client";
import { eq, getTableColumns } from "drizzle-orm";

import type { DbConnection } from "@fludge/db";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  memberId: string;
};

export class FindAllGroupsByMemberQuery {
  constructor(public readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [groups, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(group),
        })
        .from(groupMember)
        .innerJoin(group, eq(groupMember.groupId, group.id))
        .where(eq(groupMember.memberId, query.memberId)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return groups;
  }
}
