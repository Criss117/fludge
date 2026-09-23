import type { DatabaseService } from "@fludge/db";
import { member } from "@fludge/db/schema/iam.schema";
import { eq } from "drizzle-orm";

/**
 * Retorna los IDs de todas las organizaciones en las que el usuario es miembro.
 */
export class UserOrganizationIdsService {
  constructor(private readonly db: DatabaseService) {}

  public async execute(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId));

    return rows.map((r) => r.organizationId);
  }
}
