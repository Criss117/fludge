import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { member, user } from "@fludge/db/schemas/auth.schema";
import { category } from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllCategoriesQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(category),
          createdBy: {
            memberId: member.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(category)
        .leftJoin(
          member,
          and(
            eq(member.id, category.createdBy),
            eq(member.organizationId, category.organizationId),
          ),
        )
        .leftJoin(user, eq(user.id, member.userId))
        .where(eq(category.organizationId, query.organizationId))
        .orderBy(desc(category.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salió mal al buscar categorías",
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