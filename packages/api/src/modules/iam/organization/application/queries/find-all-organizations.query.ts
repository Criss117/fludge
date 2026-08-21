import { jsonObject, type DatabaseService } from "@fludge/db";
import {
  member,
  organization,
  type MemberSelect,
} from "@fludge/db/schema/auth.schema";
import { group, type GroupSelect } from "@fludge/db/schema/iam.schema";
import type { AppStatement } from "@fludge/utils/permissions";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { desc, eq, getColumns, sql } from "drizzle-orm";

export class FindAllOrganizationsQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(loggedUserId: string) {
    const [allOrganizations, errorFindingOrganizations] = await tryCatch(
      this.db
        .select({
          ...getColumns(organization),
          members: sql<string>`
              json_group_array(
                ${jsonObject(member)}
              )
          `.as("members"),
          groups: sql<string>`
              json_group_array(
                ${jsonObject(group)}
              )
          `.as("groups"),
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(group, eq(group.organizationId, organization.id))
        .where(eq(member.userId, loggedUserId))
        .orderBy(desc(organization.createdAt))
        .groupBy(organization.id),
    );

    if (errorFindingOrganizations)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener organizaciones",
        cause: errorFindingOrganizations.cause,
      });

    return allOrganizations.map((o) => ({
      ...o,
      members: (JSON.parse(o.members) as MemberSelect[]).map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
      groups: (JSON.parse(o.groups) as GroupSelect[]).map((g) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt),
        deletedAt: g.deletedAt ? new Date(g.deletedAt) : null,
        permissions: JSON.parse(g.permissions as string) as AppStatement,
      })),
    }));
  }
}
