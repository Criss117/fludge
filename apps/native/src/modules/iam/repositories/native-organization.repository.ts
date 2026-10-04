import type { DatabaseService } from "@/integrations/db";
import { OrganizationSummary } from "@fludge/client/iam/domain/entities";
import type { OrganizationRepository } from "@fludge/client/iam/domain/organization.repository";
import { localOrganization } from "@fludge/db/local-schemas/shared.schema";

import { inArray } from "drizzle-orm";

export class NativeOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(localOrganization).run();
    });
  }

  public async delete(organizationId: string | string[]): Promise<void> {
    const organizationIds = Array.isArray(organizationId)
      ? organizationId
      : [organizationId];

    this.db
      .delete(localOrganization)
      .where(inArray(localOrganization.id, organizationIds))
      .run();
  }

  public async findAll(): Promise<OrganizationSummary[]> {
    return this.db.select().from(localOrganization).all();
  }

  public async save(data: OrganizationSummary): Promise<void> {
    this.db
      .insert(localOrganization)
      .values(data)
      .onConflictDoUpdate({
        target: localOrganization.id,
        set: {
          address: data.address,
          legalName: data.legalName,
          name: data.name,
          phone: data.phone,
          updatedAt: data.updatedAt,
          slug: data.slug,
          status: data.status,
        },
      })
      .run();
  }
}
