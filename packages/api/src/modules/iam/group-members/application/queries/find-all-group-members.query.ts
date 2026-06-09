import { and, eq, getTableColumns, not } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { member, user } from "@fludge/db/schemas/auth.schema";

type Query = {
  organizationId: string;
};

export class FindAllGroupMembersQuery {
  constructor(public readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(groupMember),
          assignedBy: {
            memberId: groupMember.assignedBy,
            name: user.name,
            email: user.email,
          },
        })
        .from(groupMember)
        .innerJoin(group, eq(group.id, groupMember.groupId))
        .leftJoin(member, eq(member.id, groupMember.memberId))
        .leftJoin(user, eq(user.id, member.userId))
        .where(
          and(
            not(eq(member.role, "owner")),
            eq(group.organizationId, query.organizationId),
          ),
        ),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return data.map(({ assignedBy, ...rest }) => ({
      ...rest,
      assignedBy:
        assignedBy.memberId && assignedBy.name && assignedBy.email
          ? (assignedBy as { memberId: string; name: string; email: string })
          : null,
    }));
  }
}
