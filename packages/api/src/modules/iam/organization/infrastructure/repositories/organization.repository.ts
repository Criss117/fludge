import { and, desc, eq, getColumns, sql } from "drizzle-orm";
import {
  jsonObject,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import {
  member,
  organization,
  type MemberSelect,
  type OrganizationInsert,
} from "@fludge/db/schema/iam.schema";
import {
  group,
  groupMember,
  type GroupMemberSelect,
  type GroupSelect,
} from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { alias } from "drizzle-orm/sqlite-core";
import type { GroupRepository } from "./group.repository";
import type { MemberRepository } from "./member.repository";
import type { GroupMemberRepository } from "./group-member.repository";
import type { PermissionEnum } from "@fludge/utils/permissions/data";

const memberAuth = alias(member, "memberAuth");

type Options = { tx?: TransactionService };

export class OrganizationRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  public async findOneById(
    loggedUserId: string,
    organizationId: string,
  ): Promise<Result<Organization | null, Error>> {
    const [orgs, errOrg] = await tryCatch(
      this.db
        .select({
          ...getColumns(organization),
          members: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(member)}
              ) FILTER (WHERE ${member.userId} IS NOT NULL)
          `.as("members"),
          groups: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(group)}
              ) FILTER (WHERE ${group.id} IS NOT NULL)
          `.as("groups"),

          groupMembers: sql<string>`
              json_group_array(
                DISTINCT ${jsonObject(groupMember)}
              ) FILTER (WHERE ${groupMember.groupId} IS NOT NULL)
          `.as("groupMembers"),
        })
        .from(organization)
        .innerJoin(
          memberAuth,
          and(
            eq(memberAuth.organizationId, organization.id),
            eq(memberAuth.userId, loggedUserId),
          ),
        )
        .leftJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(group, eq(group.organizationId, organization.id))
        .leftJoin(groupMember, eq(groupMember.organizationId, organization.id))
        .where(eq(organization.id, organizationId))
        .orderBy(desc(organization.createdAt))
        .groupBy(organization.id),
    );

    if (errOrg) return err(errOrg);

    const org = orgs.at(0);

    if (!org) return ok(null);

    const members = (JSON.parse(org.members) as MemberSelect[]).map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
    const groups = (JSON.parse(org.groups) as GroupSelect[]).map((g) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
      permissions: JSON.parse(
        g.permissions as unknown as string,
      ) as PermissionEnum[],
    }));

    const groupMembers = (
      JSON.parse(org.groupMembers) as GroupMemberSelect[]
    ).map((gm) => ({
      ...gm,
      createdAt: new Date(gm.createdAt),
    }));

    return ok(
      Organization.reconstitute({
        ...org,
        members: members,
        groups: groups,
        groupMembers: groupMembers,
      }),
    );
  }

  public async saveOnlyOrganization(
    data: Organization,
    options?: Options,
  ): Promise<Result<undefined, Error>> {
    const db = options?.tx ?? this.db;
    const values = data.values;

    const insertValues: OrganizationInsert = {
      address: values.address,
      legalName: values.legalName,
      logo: values.logo,
      metadata: values.metadata,
      name: values.name,
      phone: values.phone,
      taxId: values.taxId,
      updatedAt: values.updatedAt,
      id: values.id,
      slug: values.slug,
      createdAt: values.createdAt,
      status: values.status,
    };

    const [, errInsert] = await tryCatch(
      db
        .insert(organization)
        .values(insertValues)
        .onConflictDoUpdate({
          target: organization.id,
          set: insertValues,
        })
        .returning(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async save(data: Organization): Promise<Result<undefined, Error>> {
    const { groups, members, groupMembers } = data.values;

    const transaction = this.db.transaction(async (tx) => {
      const [, errInsertOrganization] = await this.saveOnlyOrganization(data, {
        tx: tx,
      });

      if (errInsertOrganization) throw errInsertOrganization;

      if (members.length > 0) {
        const [, errInsertMembers] = await this.memberRepository.save(
          data.id.toString(),
          data.members.all,
          {
            tx: tx,
          },
        );

        if (errInsertMembers) throw errInsertMembers;
      }

      if (groups.length > 0) {
        const [, errInsertGroups] = await this.groupRepository.save(
          data.id.toString(),
          data.groups.all,
          {
            tx: tx,
          },
        );

        if (errInsertGroups) throw errInsertGroups;
      }

      if (groupMembers.length > 0) {
        const [, errInsertGroupMembers] = await this.groupMemberRepository.save(
          data.id.toString(),
          data.groupMembers,
          {
            tx: tx,
          },
        );

        if (errInsertGroupMembers) throw errInsertGroupMembers;
      }
    });

    const [, errTransaction] = await tryCatch(transaction);

    if (errTransaction) return err(errTransaction);

    return ok(undefined);
  }
}
