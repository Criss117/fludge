import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import type {
  Options,
  OrganizationRepository,
} from "@fludge/api/core/iam/domain/repositories/organization.repository";
import { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import { organization } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { eq } from "drizzle-orm";

export class SQLiteOrganizationRepository
  extends TransactionalRepository
  implements OrganizationRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findById(organizationId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(organization)
        .where(eq(organization.id, organizationId)),
    );

    if (errFind) return err(errFind);

    const org = rows.at(0);

    if (!org) return ok(null);

    return ok(Organization.reconstitute(org));
  }

  public async save(organizationEntity: Organization, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = organizationEntity.values;

    const [, errInsert] = await tryCatch(
      db
        .insert(organization)
        .values(values)
        .onConflictDoUpdate({
          target: organization.id,
          set: {
            address: values.address,
            legalName: values.legalName,
            name: values.name,
            phone: values.phone,
            status: values.status,
            updatedAt: values.updatedAt,
            slug: values.slug,
          },
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
