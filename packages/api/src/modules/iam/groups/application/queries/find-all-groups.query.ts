import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { member, user } from "@fludge/db/schemas/auth.schema";
import { group } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllGroupsQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(group),
          createdBy: {
            memberId: member.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(group)
        .leftJoin(
          member,
          and(
            eq(member.id, group.createdBy),
            eq(member.organizationId, group.organizationId),
          ),
        )
        .leftJoin(user, eq(user.id, member.userId))
        .where(eq(group.organizationId, query.organizationId))
        .orderBy(desc(group.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salio mal al buscar grupos",
      });

    return data.map(({ createdBy, ...rest }) => ({
      ...rest,
      createdBy:
        createdBy.memberId && createdBy.name && createdBy.email
          ? (createdBy as { memberId: string; name: string; email: string })
          : null,
    }));
  }
}
