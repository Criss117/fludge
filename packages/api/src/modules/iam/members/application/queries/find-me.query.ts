import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { member } from "@fludge/db/schemas/auth.schema";
import type { Permission } from "@fludge/utils/permissions/data";
import { tryCatch } from "@fludge/utils/trycatch";

import { groupsContainer } from "@fludge/api/modules/iam/groups/container";

type Query = {
  memberId: string;
};

export type FindMeResponse = {
  id: string;
  role: "owner" | "admin" | "member";
  permissions: Permission[];
};

export class FindMeQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute({ memberId }: Query): Promise<FindMeResponse> {
    const [memberData, memberError] = await tryCatch(
      this.db
        .select({
          id: member.id,
          role: member.role,
        })
        .from(member)
        .where(eq(member.id, memberId))
        .limit(1),
    );

    if (memberError)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al recuperar el miembro",
      });

    const memberRecord = memberData[0];

    if (!memberRecord)
      throw new ORPCError("NOT_FOUND", {
        message: "Miembro no encontrado",
      });

    const { id, role } = memberRecord;

    const groups = await groupsContainer.queries.findAllByMember.execute({
      memberId,
      options: { excludeDeleted: true },
    });

    const permissions = [
      ...new Set(groups.flatMap((g) => g.permissions)),
    ] as Permission[];

    return {
      id,
      role: role as FindMeResponse["role"],
      permissions,
    };
  }
}
