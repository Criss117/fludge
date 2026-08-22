import { eq } from "drizzle-orm";
import { buildConflictUpdateColumn, type DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/auth.schema";
import { group, groupMember } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization";

export class PgOrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findOneById(id: string) {
    const [orgs, errOrg] = await tryCatch(
      this.db
        .select()
        .from(organization)
        .where(eq(organization.id, id))
        .limit(1),
    );

    if (errOrg) return err(errOrg);

    const org = orgs.at(0);

    if (!org) return ok(null);

    const membersQuery = this.db
      .select()
      .from(member)
      .where(eq(member.organizationId, org.id));

    const groupsQuery = this.db
      .select()
      .from(group)
      .where(eq(group.organizationId, org.id));

    const groupMembersQuery = this.db
      .select()
      .from(groupMember)
      .where(eq(groupMember.organizationId, org.id));

    const [result, errFind] = await tryCatch(
      Promise.all([membersQuery, groupsQuery, groupMembersQuery]),
    );

    if (errFind) return err(errFind);

    const [members, groups, groupMembers] = result;

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
