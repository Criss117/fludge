import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { user } from "@fludge/db/schema/auth.schema";
import { member } from "@fludge/db/schema/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, getColumns } from "drizzle-orm";

export class FindAllMembersQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const [members, errorFindingMembers] = await tryCatch(
      this.db
        .select({
          ...getColumns(member),
          user: getColumns(user),
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(eq(member.organizationId, organizationId)),
    );

    if (errorFindingMembers)
      throw new InternalServerError(
        errorFindingMembers,
        "iam.members.errors.isr_on_find",
      );

    return members;
  }
}
