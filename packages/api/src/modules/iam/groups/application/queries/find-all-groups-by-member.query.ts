import { eq, getTableColumns } from "drizzle-orm";

import type { DbConnection } from "@fludge/db";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/client";

export class FindAllGroupsByMemberQuery {
  constructor(public readonly db: DbConnection) {}

  public async execute(memberId: string) {
    const [groups, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(group),
        })
        .from(groupMember)
        .innerJoin(group, eq(groupMember.groupId, group.id))
        .where(eq(groupMember.memberId, memberId)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return groups;
  }
}
