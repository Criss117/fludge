import { z } from "zod";
import { and, count, eq, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { tryCatch } from "@fludge/utils/trycatch";
import { group } from "@fludge/db/schemas/iam.schema";

export const organizationHasGroupsQuery = z.object({
  groupIds: z
    .array(
      z.string({
        error: "Id de miembro no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de miembro.",
    }),
});

type Query = z.infer<typeof organizationHasGroupsQuery> & {
  organizationId: string;
};

export class OrganizationHasGroupsQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ organizationId, groupIds }: Query) {
    if (groupIds.length === 0)
      throw new ORPCError("BAD_REQUEST", {
        message: "No se especificó ningún id de miembro",
      });

    const where = [
      eq(group.organizationId, organizationId),
      inArray(group.id, groupIds),
    ];

    const [exists, error] = await tryCatch(
      this.db
        .select({
          total: count(group.id),
        })
        .from(group)
        .where(and(...where)),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    const e = exists.at(0);

    if (!e)
      return {
        exists: false,
      };

    if (e.total !== groupIds.length)
      return {
        exists: false,
      };

    return {
      exists: true,
    };
  }
}
