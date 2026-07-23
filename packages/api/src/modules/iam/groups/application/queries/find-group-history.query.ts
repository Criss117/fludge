import { z } from "zod";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

import type { DBConnection } from "@fludge/db";
import { group, groupHistory } from "@fludge/db/schemas/iam.schema";
import { member, user } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";

export const findGroupHistoryQuery = z.object({
  groupId: z.uuid({
    error: "El id del grupo es requerido",
  }),
});

type Query = z.infer<typeof findGroupHistoryQuery> & {
  organizationId: string;
};

export class FindGroupHistoryQuery {
  constructor(private readonly db: DBConnection) {}

  public async execute({ groupId, organizationId }: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(groupHistory),
          actorName: user.name,
        })
        .from(groupHistory)
        .innerJoin(group, eq(group.id, groupHistory.groupId))
        .leftJoin(member, eq(member.id, groupHistory.createdBy))
        .leftJoin(user, eq(user.id, member.userId))
        .where(
          and(
            eq(groupHistory.groupId, groupId),
            eq(group.organizationId, organizationId),
          ),
        )
        .orderBy(desc(groupHistory.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salio mal al buscar el historial del grupo",
      });

    return data;
  }
}
