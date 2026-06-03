import { z } from "zod";
import { and, count, eq, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { tryCatch } from "@fludge/utils/trycatch";
import { member } from "@fludge/db/schemas/auth.schema";

export const organizationHasMembersQuery = z.object({
  memberIds: z
    .array(
      z.string({
        error: "Id de miembro no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de miembro.",
    }),
  options: z
    .object({
      filterBy: z.enum(["owner", "member", "all"]),
    })
    .optional(),
});

type Query = z.infer<typeof organizationHasMembersQuery> & {
  organizationId: string;
};

export class OrganizationHasMembersQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ organizationId, memberIds, options }: Query) {
    if (!Array.isArray(memberIds)) memberIds = [memberIds];

    if (memberIds.length === 0)
      throw new ORPCError("BAD_REQUEST", {
        message: "No se especificó ningún id de miembro",
      });

    const where = [
      eq(member.organizationId, organizationId),
      inArray(member.id, memberIds),
    ];

    if (options?.filterBy === "owner") {
      where.push(eq(member.role, "owner"));
    } else if (options?.filterBy === "member") {
      where.push(eq(member.role, "member"));
    }

    const [exists, error] = await tryCatch(
      this.db
        .select({
          total: count(member.id),
        })
        .from(member)
        .where(and(...where)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    const e = exists.at(0);

    if (!e)
      return {
        exists: false,
      };

    if (e.total !== memberIds.length)
      return {
        exists: false,
      };

    return {
      exists: true,
    };
  }
}
