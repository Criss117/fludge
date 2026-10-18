import type { OrganizationSummary } from "@fludge/client/iam/domain/entities";
import type { OrganizationRepository } from "@fludge/client/iam/domain/organization.repository";
import {
  type LocalOrganization,
  localOrganization,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { eq, inArray } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findOneById(
    organizationId: string,
  ): Promise<Result<OrganizationSummary | null, RepositoryError>> {
    return tryCatch(
      () => {
        const raws = this.db
          .select()
          .from(localOrganization)
          .where(eq(localOrganization.id, organizationId))
          .all();

        const org = raws.at(0);

        if (!org) return null;

        return org;
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_find", raw),
      },
    );
  }

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(localOrganization).run();

          tx.delete(localUser).where(eq(localUser.isRoot, true)).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_delete", raw),
      },
    );
  }

  public async delete(organizationId: string | string[]): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const organizationIds = Array.isArray(organizationId) ? organizationId : [organizationId];

        this.db
          .delete(localOrganization)
          .where(inArray(localOrganization.id, organizationIds))
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_delete", raw),
      },
    );
  }

  public async findAll(): Promise<Result<OrganizationSummary[], RepositoryError>> {
    return tryCatch(
      () => {
        return this.db.select().from(localOrganization).all();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_find", raw),
      },
    );
  }

  public async save(
    data: LocalOrganization | LocalOrganization[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const organizations = Array.isArray(data) ? data : [data];

        for (const organization of organizations) {
          this.db
            .insert(localOrganization)
            .values(organization)
            .onConflictDoUpdate({
              target: localOrganization.id,
              set: {
                address: organization.address,
                legalName: organization.legalName,
                name: organization.name,
                phone: organization.phone,
                updatedAt: organization.updatedAt,
                slug: organization.slug,
                status: organization.status,
              },
            })
            .run();
        }
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_save", raw),
      },
    );
  }
}
