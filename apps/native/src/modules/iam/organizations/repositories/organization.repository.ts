import type { DatabaseService } from "@/integrations/db";
import type {
  OrganizationDetail,
  OrganizationRepository,
} from "@fludge/client/application/iam/domain/organization.repository";
import {
  group,
  groupMember,
  member,
  organization,
} from "@fludge/db/local-schemas/iam.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { LocalOrganization } from "@fludge/sync/entities/iam.entities";
import { eq, inArray } from "drizzle-orm";

export class SqliteOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async delete(organizationId: string | string[]): Promise<void> {
    const organizationIds = Array.isArray(organizationId)
      ? organizationId
      : [organizationId];

    await this.db
      .delete(organization)
      .where(inArray(organization.id, organizationIds));
  }

  public async findAll(): Promise<LocalOrganization[]> {
    return this.db.select().from(organization);
  }

  public async save(data: OrganizationDetail): Promise<void> {
    const {
      groups: groupsData,
      members: membersData,
      groupMembers: groupMembersData,
      ...organizationData
    } = data;

    this.db.transaction((tx) => {
      tx.insert(organization)
        .values(organizationData)
        .onConflictDoUpdate({
          target: organization.id,
          set: organizationData,
        })
        .run();

      tx.insert(member)
        .values(membersData)
        .onConflictDoUpdate({
          target: member.id,
          set: buildConflictUpdateColumn(member, [
            "userId",
            "assignedBy",
            "role",
          ]),
        })
        .run();

      tx.insert(group)
        .values(groupsData)
        .onConflictDoUpdate({
          target: group.id,
          set: buildConflictUpdateColumn(group, [
            "name",
            "slug",
            "description",
            "permissions",
            "updatedAt",
          ]),
        })
        .run();

      tx.delete(groupMember)
        .where(eq(groupMember.organizationId, organizationData.id))
        .run();

      tx.insert(groupMember)
        .values(groupMembersData)
        .onConflictDoNothing()
        .run();
    });
  }
}
