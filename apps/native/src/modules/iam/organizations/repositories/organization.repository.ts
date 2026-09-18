import type { DatabaseService } from "@/integrations/db";
import type {
  OrganizationDetail,
  OrganizationRepository,
} from "@fludge/client/application/iam/domain/organization.repository";
import {
  localGroup,
  localGroupMember,
  localMember,
  localOrganization,
  type LocalOrganizationSelect,
} from "@fludge/db/local-schemas/shared.schema";

import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { eq, inArray } from "drizzle-orm";

export class SqliteOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async delete(organizationId: string | string[]): Promise<void> {
    const organizationIds = Array.isArray(organizationId)
      ? organizationId
      : [organizationId];

    await this.db
      .delete(localOrganization)
      .where(inArray(localOrganization.id, organizationIds));
  }

  public async findAll(): Promise<LocalOrganizationSelect[]> {
    return this.db.select().from(localOrganization);
  }

  public async save(data: OrganizationDetail): Promise<void> {
    const {
      groups: groupsData,
      members: membersData,
      groupMembers: groupMembersData,
      ...organizationData
    } = data;

    this.db.transaction((tx) => {
      tx.insert(localOrganization)
        .values(organizationData)
        .onConflictDoUpdate({
          target: localOrganization.id,
          set: organizationData,
        })
        .run();

      tx.insert(localMember)
        .values(membersData)
        .onConflictDoUpdate({
          target: localMember.id,
          set: buildConflictUpdateColumn(localMember, [
            "userId",
            "assignedBy",
            "role",
          ]),
        })
        .run();

      tx.insert(localGroup)
        .values(groupsData)
        .onConflictDoUpdate({
          target: localGroup.id,
          set: buildConflictUpdateColumn(localGroup, [
            "name",
            "slug",
            "description",
            "permissions",
            "updatedAt",
          ]),
        })
        .run();

      tx.delete(localGroupMember)
        .where(eq(localGroupMember.organizationId, organizationData.id))
        .run();

      tx.insert(localGroupMember)
        .values(groupMembersData)
        .onConflictDoNothing()
        .run();
    });
  }
}
