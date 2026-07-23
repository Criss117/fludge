import type { DBConnection } from "@fludge/db";
import { member } from "@fludge/db/schemas/auth.schema";
import { group } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { and, count, eq, inArray } from "drizzle-orm";

type HasMembersQuery = {
  memberIds: string[];
  options?: {
    filterBy: "all" | "member" | "owner";
  };
  organizationId: string;
};

type HasGroupsQuery = {
  groupIds: string[];
  organizationId: string;
};

export class OrganizationHasService {
  constructor(private readonly db: DBConnection) {}

  public async hasMembers({
    memberIds,
    organizationId,
    options,
  }: HasMembersQuery) {
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

  public async hasGroups({ groupIds, organizationId }: HasGroupsQuery) {
    if (groupIds.length === 0)
      throw new ORPCError("BAD_REQUEST", {
        message: "No se especificó ningún id de grupo",
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
