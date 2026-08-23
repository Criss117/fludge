import type { DatabaseService } from "@fludge/db";
import { organization } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, ne, or, SQL } from "drizzle-orm";

type Values = {
  slug?: string;
  taxId?: string;
  phone?: string;
  legalName?: string;
  name?: string;
};

export class OrganizationUniquenessValidator {
  constructor(private readonly db: DatabaseService) {}

  public async validateUniqueFields(value: Values, excludeId?: string) {
    const { legalName, name, phone, taxId, slug } = value;

    const orConditions = [
      legalName && eq(organization.legalName, legalName),
      name && eq(organization.name, name),
      phone && eq(organization.phone, phone),
      taxId && eq(organization.taxId, taxId),
      slug && eq(organization.slug, slug),
    ].filter(Boolean) as SQL[];

    if (orConditions.length === 0)
      return ok({
        legalNameTaken: false,
        nameTaken: false,
        phoneTaken: false,
        taxIdTaken: false,
        slugTaken: false,
      });

    const conditions = [or(...orConditions)];

    if (excludeId) {
      conditions.push(ne(organization.id, excludeId));
    }

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          legalName: organization.legalName,
          name: organization.name,
          phone: organization.phone,
          taxId: organization.taxId,
          slug: organization.slug,
        })
        .from(organization)
        .where(and(...conditions)),
    );

    if (errFind) return err(errFind);

    const legalNameTaken = rows.some((r) => r.legalName === legalName);
    const nameTaken = rows.some((r) => r.name === name);
    const phoneTaken = rows.some((r) => r.phone === phone);
    const taxIdTaken = rows.some((r) => r.taxId === taxId);
    const slugTaken = rows.some((r) => r.slug === slug);

    return ok({
      legalNameTaken,
      nameTaken,
      phoneTaken,
      taxIdTaken,
      slugTaken,
    });
  }
}
