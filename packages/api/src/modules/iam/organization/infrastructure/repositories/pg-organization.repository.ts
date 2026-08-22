import { and, desc, eq, getColumns, sql } from "drizzle-orm";
import {
  buildConflictUpdateColumn,
  jsonObject,
  type DatabaseService,
} from "@fludge/db";
import {
  member,
  organization,
  type MemberSelect,
} from "@fludge/db/schema/iam.schema";
import {
  group,
  groupMember,
  type GroupMemberSelect,
  type GroupSelect,
} from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization";
import type { AppStatement } from "@fludge/utils/permissions";
import { alias } from "drizzle-orm/sqlite-core";

const memberAuth = alias(member, "memberAuth");

export class PgOrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findOneById(loggedUserId: string, organizationId: string) {
    const [orgs, errOrg] = await tryCatch(
      this.db
        .select({
          ...getColumns(organization),
          members: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(member)}
              ) FILTER (WHERE ${member.userId} IS NOT NULL)
          `.as("members"),
          groups: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(group)}
              ) FILTER (WHERE ${group.id} IS NOT NULL)
          `.as("groups"),

          groupMembers: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(groupMember)}
              ) FILTER (WHERE ${groupMember.groupId} IS NOT NULL)
          `.as("groupMembers"),
        })
        .from(organization)
        .innerJoin(
          memberAuth,
          and(
            eq(memberAuth.organizationId, organization.id),
            eq(memberAuth.userId, loggedUserId),
          ),
        )
        .leftJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(group, eq(group.organizationId, organization.id))
        .leftJoin(groupMember, eq(groupMember.organizationId, organization.id))
        .where(eq(organization.id, organizationId))
        .orderBy(desc(organization.createdAt))
        .groupBy(organization.id),
    );

    if (errOrg) return err(errOrg);

    const org = orgs.at(0);

    if (!org) return ok(null);

    const members = (JSON.parse(org.members) as MemberSelect[]).map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
    const groups = (JSON.parse(org.groups) as GroupSelect[]).map((g) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
      deletedAt: g.deletedAt ? new Date(g.deletedAt) : null,
      permissions: JSON.parse(g.permissions as string) as AppStatement,
    }));

    const groupMembers = (
      JSON.parse(org.groupMembers) as GroupMemberSelect[]
    ).map((gm) => ({
      ...gm,
      createdAt: new Date(gm.createdAt),
    }));

    return ok(
      Organization.reconstitute({
        ...org,
        members: members,
        groups: groups,
        groupMembers: groupMembers,
      }),
    );
  }

  public async save(data: Organization) {
    const { groups, members, groupMembers, ...values } = data.values;
    console.log("insertando group members");

    const transaction = this.db.transaction(async (tx) => {
      const newOrganizations = await tx
        .insert(organization)
        .values(values)
        .onConflictDoUpdate({
          target: organization.id,
          set: values,
        })
        .returning();

      const newOrganization = newOrganizations.at(0)!;

      if (members.length > 0) {
        await tx
          .insert(member)
          .values(members)
          .onConflictDoUpdate({
            target: member.id,
            set: buildConflictUpdateColumn(member, [
              "userId",
              "assignedBy",
              "role",
            ]),
          });
      }

      if (groups.length > 0) {
        await tx
          .insert(group)
          .values(groups)
          .onConflictDoUpdate({
            target: group.id,
            set: buildConflictUpdateColumn(group, [
              "name",
              "slug",
              "description",
              "permissions",
              "deletedAt",
              "updatedAt",
            ]),
          });
      }

      if (groupMembers.length > 0) {
        await tx.insert(groupMember).values(groupMembers).onConflictDoNothing();
      }

      return newOrganization;
    });

    return tryCatch(transaction);
  }
}
