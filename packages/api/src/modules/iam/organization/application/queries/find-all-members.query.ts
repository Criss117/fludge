import type { DatabaseService } from "@fludge/db";
import { user } from "@fludge/db/schema/auth.schema";
import { member } from "@fludge/db/schema/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { eq, getColumns } from "drizzle-orm";

export class FindAllMembersQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const [members, errorFindingMembers] = await tryCatch(
      this.db
        .select({
          ...getColumns(member),
          user: getColumns(user),
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(eq(member.organizationId, organizationId)),
    );

    if (errorFindingMembers)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener miembros",
        cause: errorFindingMembers.cause,
      });

    return members;
  }
}
