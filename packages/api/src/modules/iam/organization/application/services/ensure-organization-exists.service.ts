import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { eq } from "drizzle-orm";

export class EnsureOrganizationExistsService {
  constructor(private readonly db: DatabaseService) {}

  public async byId(organizationId: string) {
    const [exists, errOrganization] = await tryCatch(
      this.db
        .select({
          id: organization.id,
        })
        .from(organization)
        .where(eq(organization.id, organizationId))
        .limit(1),
    );

    if (errOrganization) return err(errOrganization);

    if (exists.length === 0) return ok(false);

    return ok(true);
  }

  public async byIdAndUserId(organizationId: string, userId: string) {
    const [exists, errOrganization] = await tryCatch(
      this.db
        .select({
          id: organization.id,
        })
        .from(organization)
        .innerJoin(member, eq(member.userId, userId))
        .where(eq(organization.id, organizationId))
        .limit(1),
    );

    if (errOrganization) return err(errOrganization);

    const org = exists.at(0);

    if (!org) return ok(false);

    return ok(true);
  }
}
