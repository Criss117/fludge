import type { DatabaseService } from "@/integrations/db";
import { OrganizationSummary } from "@fludge/client/application/iam/domain/entities";
import type { OrganizationRepository } from "@fludge/client/application/iam/domain/organization.repository";
import { localOrganization } from "@fludge/db/local-schemas/shared.schema";

import { inArray } from "drizzle-orm";

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

  public async findAll(): Promise<OrganizationSummary[]> {
    return this.db.select().from(localOrganization);
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
