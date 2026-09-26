import type { AuthService } from "@fludge/auth";
import type { DatabaseService } from "@fludge/db";
import {
  group,
  groupMember,
  member,
  organization,
} from "@fludge/db/schema/iam.schema";
import { user } from "@fludge/db/schema/auth.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { PERMISSIONS } from "@fludge/utils/permissions/data";
import type { Permission } from "@fludge/utils/permissions/data";
import { Slug } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/trycatch";
import { UUID } from "@fludge/utils/uuid";
import type { seedIamValidator } from "@fludge/utils/validators/seed.validators";
import { eq } from "drizzle-orm";
import pLimit from "p-limit";
import type { z } from "zod";
import { batchInsert } from "./batch-insert";

type SeedIamInput = z.infer<typeof seedIamValidator>;

type OrgSeedData = {
  id: string;
  rootUserId: string;
  ownerMemberId: string;
  members: { id: string; userId: string }[];
  groups: { id: string; createdBy: string }[];
};

export class SeedIamService {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  public async seed(headers: Headers, input: SeedIamInput) {
    const commonPassword = "holiwis123";
    const limit = pLimit(5);

    // 1. Obtener rootUsers
    const [rootUsers, errRoots] = await tryCatch(
      this.db.select().from(user).where(eq(user.isRoot, true)),
    );
    if (errRoots)
      throw new Error("Error fetching root users", { cause: errRoots });
    if (rootUsers.length === 0) {
      throw new Error("No root users found. Run seedUsers first.");
    }

    // 2. Preparar organizaciones y owner members
    const orgsToInsert: (typeof organization.$inferInsert)[] = [];
    const ownerMembersToInsert: (typeof member.$inferInsert)[] = [];
    const orgDataMap = new Map<string, OrgSeedData>();

    for (const [rootIdx, rootUser] of rootUsers.entries()) {
      for (let i = 0; i < input.organizationsPerRoot; i++) {
        const orgId = UUID.generate().toString();
        const ownerMemberId = UUID.generate().toString();
        const companyName = `Empresa ${rootIdx}-${i}`;

        orgsToInsert.push({
          id: orgId,
          name: companyName,
          slug: `${new Slug(companyName)}-${orgId.slice(0, 4)}`,
          legalName: `${companyName} S.A.S.`,
          taxId: faker.string.numeric(10),
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
        });

        ownerMembersToInsert.push({
          id: ownerMemberId,
          userId: rootUser.id,
          role: "owner",
          organizationId: orgId,
          assignedBy: null,
        });

        orgDataMap.set(orgId, {
          id: orgId,
          rootUserId: rootUser.id,
          ownerMemberId,
          members: [{ id: ownerMemberId, userId: rootUser.id }],
          groups: [],
        });
      }
    }

    // 3. Batch insert organizations
    const [, errOrgs] = await tryCatch(
      batchInsert(this.db, organization, orgsToInsert),
    );
    if (errOrgs)
      throw new Error("Error inserting organizations", { cause: errOrgs });

    // 4. Batch insert owner members
    const [, errOwners] = await tryCatch(
      batchInsert(this.db, member, ownerMembersToInsert),
    );
    if (errOwners)
      throw new Error("Error inserting owner members", { cause: errOwners });

    // 5. Crear usuarios normales via betterAuth (limitado a 5 concurrentes)
    const userCreationTasks: {
      email: string;
      name: string;
      phone: string;
      orgId: string;
    }[] = [];
    for (const [orgId] of orgDataMap) {
      for (let i = 0; i < input.membersPerOrganization; i++) {
        userCreationTasks.push({
          email: `seed-${orgId.slice(0, 4)}-${i}-${faker.string.alphanumeric(4).toLowerCase()}@fludge.com`,
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          orgId,
        });
      }
    }

    const userResults = await Promise.all(
      userCreationTasks.map((task) =>
        limit(async () => {
          const [result, err] = await tryCatch(
            this.authService.api.signUpEmail({
              body: {
                email: task.email,
                password: commonPassword,
                isRoot: false,
                phone: task.phone,
                name: task.name,
              },
              headers,
            }),
          );
          if (err)
            throw new Error(`Error creating user ${task.email}`, {
              cause: err,
            });
          return { userId: result.user.id, orgId: task.orgId };
        }),
      ),
    );

    // 6. Preparar e insertar members normales en batch
    const normalMembersToInsert: (typeof member.$inferInsert)[] = [];
    for (const { userId, orgId } of userResults) {
      const memberId = UUID.generate().toString();
      const orgData = orgDataMap.get(orgId)!;

      normalMembersToInsert.push({
        id: memberId,
        userId,
        role: "member",
        organizationId: orgId,
        assignedBy: orgData.ownerMemberId,
      });

      orgData.members.push({ id: memberId, userId });
    }

    if (normalMembersToInsert.length > 0) {
      const [, errMembers] = await tryCatch(
        batchInsert(this.db, member, normalMembersToInsert),
      );
      if (errMembers)
        throw new Error("Error inserting members", { cause: errMembers });
    }

    // 7. Preparar e insertar groups en batch
    const groupsToInsert: (typeof group.$inferInsert)[] = [];
    let orgIdx = 0;
    for (const [orgId, orgData] of orgDataMap) {
      for (let i = 0; i < input.groupPerOrganization; i++) {
        const groupId = UUID.generate().toString();
        const groupName = `Grupo ${orgIdx}-${i}`;

        groupsToInsert.push({
          id: groupId,
          name: groupName,
          slug: `${new Slug(groupName)}-${groupId.slice(0, 4)}`,
          description: faker.lorem.sentence(),
          permissions: this.generateRandomPermissions(),
          organizationId: orgId,
          createdBy: orgData.ownerMemberId,
        });

        orgData.groups.push({ id: groupId, createdBy: orgData.ownerMemberId });
      }
      orgIdx++;
    }

    if (groupsToInsert.length > 0) {
      const [, errGroups] = await tryCatch(
        batchInsert(this.db, group, groupsToInsert),
      );
      if (errGroups)
        throw new Error("Error inserting groups", { cause: errGroups });
    }

    // 8. Preparar e insertar groupMembers en batch
    const groupMembersToInsert: (typeof groupMember.$inferInsert)[] = [];

    for (const [orgId, orgData] of orgDataMap) {
      if (orgData.members.length === 0 || orgData.groups.length === 0) continue;

      const memberIds = orgData.members.map((m) => m.id);
      const groupIds = orgData.groups.map((g) => g.id);

      for (const groupId of groupIds) {
        const numAssignments = faker.number.int({
          min: 1,
          max: memberIds.length,
        });
        const selectedMemberIds = faker.helpers.arrayElements(
          memberIds,
          numAssignments,
        );

        for (const memberId of selectedMemberIds) {
          groupMembersToInsert.push({
            groupId,
            memberId,
            organizationId: orgId,
            createdBy: orgData.ownerMemberId,
          });
        }
      }
    }

    if (groupMembersToInsert.length > 0) {
      const [, errGM] = await tryCatch(
        batchInsert(this.db, groupMember, groupMembersToInsert),
      );
      if (errGM)
        throw new Error("Error inserting group members", { cause: errGM });
    }

    return {
      organizationsCreated: orgsToInsert.length,
      membersCreated: ownerMembersToInsert.length + normalMembersToInsert.length,
      groupsCreated: groupsToInsert.length,
      groupMembersCreated: groupMembersToInsert.length,
    };
  }

  private generateRandomPermissions(): Permission[] {
    const all: Permission[] = [];
    for (const [resource, actions] of Object.entries(PERMISSIONS)) {
      for (const action of actions) {
        all.push(`${resource}:${action}` as Permission);
      }
    }
    return faker.helpers.arrayElements(all, {
      min: 1,
      max: all.length,
    });
  }

  public async clearIamTables(): Promise<void> {
    const [, err] = await tryCatch(
      this.db.transaction(async (tx) => {
        await tx.delete(groupMember);
        await tx.delete(group);
        await tx.delete(member);
        await tx.delete(organization);
      }),
    );

    if (err) throw new Error("Error clearing IAM tables", { cause: err });
  }
}
