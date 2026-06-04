import { ORPCError } from "@orpc/client";
import { and, eq, getTableColumns, isNull, SQL } from "drizzle-orm";

import type { DbConnection } from "@fludge/db";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  memberId: string;
  options?: {
    excludeDeleted?: boolean;
  };
};

export class FindAllGroupsByMemberQuery {
  constructor(public readonly db: DbConnection) {}

  public async execute(query: Query) {
    const where: SQL[] = [eq(groupMember.memberId, query.memberId)];

    if (query.options?.excludeDeleted) where.push(isNull(group.deletedAt));

    const [groups, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(group),
        })
        .from(groupMember)
        .innerJoin(group, eq(groupMember.groupId, group.id))
        .where(and(...where)),
    );

    console.dir(
      this.db
        .select({
          ...getTableColumns(group),
        })
        .from(groupMember)
        .innerJoin(group, eq(groupMember.groupId, group.id))
        .where(and(...where))
        .toSQL(),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return groups;
  }
}
