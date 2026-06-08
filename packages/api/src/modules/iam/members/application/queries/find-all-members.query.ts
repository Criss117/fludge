import { and, eq, getTableColumns, not } from "drizzle-orm";
import { ORPCError } from "@orpc/client";
import { alias } from "drizzle-orm/pg-core";

import type { DbConnection } from "@fludge/db";
import { member, user } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

const assignedByMember = alias(member, "assignedByMember");
const assignedByUser = alias(user, "assignedByUser");

export class FindAllMembersQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ organizationId }: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(member),
          user: {
            name: user.name,
            email: user.email,
          },
          assignedBy: {
            memberId: assignedByMember.id,
            name: assignedByUser.name,
            email: assignedByUser.email,
          },
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .leftJoin(assignedByMember, eq(assignedByMember.id, member.assignedBy))
        .leftJoin(
          assignedByUser,
          eq(assignedByUser.id, assignedByMember.userId),
        )
        .where(
          and(
            eq(member.organizationId, organizationId),
            not(eq(member.role, "owner")),
          ),
        ),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al recuperar miembros",
      });

    return data;
  }
}
