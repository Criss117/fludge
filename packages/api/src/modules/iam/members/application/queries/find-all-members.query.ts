import { eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { member, user } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

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
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, organizationId)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al recuperar miembros",
      });

    return data;
  }
}
