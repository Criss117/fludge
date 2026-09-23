import { Group } from "../../../iam/domain/entities/group.entity";
import { UserAuthContext } from "../../../iam/domain/entities/user-auth-context.entity";
import type { MemberRepository } from "../../../iam/domain/repositories/member.repository";
import type { DatabaseService } from "@fludge/db";
import { group, groupMember, organization } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { UUID } from "@fludge/utils/uuid";
import { and, eq, getColumns } from "drizzle-orm";

export class UserAuthContextService {
  constructor(
    private readonly db: DatabaseService,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async build(loggedUserId: string, activeOrganizationId: string) {
    const [organizationExists, errOrganization] = await tryCatch(
      this.db
        .select({ id: organization.id })
        .from(organization)
        .where(eq(organization.id, activeOrganizationId)),
    );

    if (errOrganization) return err(errOrganization);

    if (organizationExists.length === 0) return ok(null);

    const [member, errMember] = await this.memberRepository.findByUserId(
      loggedUserId,
      activeOrganizationId,
    );

    if (errMember) return err(errMember);

    if (!member) return ok(null);

    const [groupRows, errGroups] = await tryCatch(
      this.db
        .select({ ...getColumns(group) })
        .from(group)
        .innerJoin(groupMember, eq(group.id, groupMember.groupId))
        .where(
          and(
            eq(groupMember.memberId, member.id.toString()),
            eq(group.organizationId, activeOrganizationId),
            eq(group.status, "active"),
          ),
        ),
    );

    if (errGroups) return err(errGroups);

    const groups = groupRows.map((groupRecord) =>
      Group.reconstitute({
        ...groupRecord,
        members: [],
      }),
    );

    return ok(
      UserAuthContext.create({
        organizationId: UUID.fromString(activeOrganizationId),
        member,
        groups,
      }),
    );
  }
}
