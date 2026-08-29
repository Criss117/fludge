import type { AuthService } from "@fludge/auth";
import type { DatabaseService } from "@fludge/db";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import {
  group,
  groupMember,
  member,
  organization,
} from "@fludge/db/schema/iam.schema";
import { account, session, user } from "@fludge/db/schema/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { Organization } from "../iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { Group } from "../iam/organization/domain/entities/group.entity";

import { faker } from "@faker-js/faker/locale/es_MX";
import { Member } from "../iam/organization/domain/entities/member.entity";
import { GroupMember } from "../iam/organization/domain/entities/group-member.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/data";

export const seedUsers = z.object({
  totalRoots: z.number().optional().default(2),
  totalMembers: z.number().optional().default(10),
  commonPassword: z.string().optional().default("holiwiss"),
});

export const seedOrganizations = z.object({
  organizationsPerUser: z.number().optional().default(2),
  groupsPerOrganization: z.number().optional().default(2),
});

export const seedAll = z.object({
  users: seedUsers,
  organizations: seedOrganizations,
});

function chunkMembersForOrganizations<T>(
  members: T[],
  totalChunks: number,
): T[][] {
  if (totalChunks <= 0) return [];

  const perChunk = Math.floor(members.length / totalChunks);
  const result: T[][] = [];

  for (let i = 0; i < totalChunks; i++) {
    const isLast = i === totalChunks - 1;
    const start = i * perChunk;
    const end = isLast ? members.length : start + perChunk;
    result.push(members.slice(start, end));
  }

  return result;
}

function generateGroups(createdBy: UUID, count: number) {
  return Array.from({ length: count }).map(() =>
    Group.create({
      name: faker.company.name(),
      permissions: Permissions.create(
        faker.helpers.arrayElements(ALL_PERMISSIONS),
      ),
      description: faker.lorem.sentence(),
      createdBy,
    }),
  );
}

export class SeedService {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
    private readonly organizationRepository: PgOrganizationRepository,
  ) {}

  public async clear() {
    const transaction = this.db.transaction(async (tx) => {
      await tx.delete(groupMember);
      await tx.delete(member);
      await tx.delete(group);
      await tx.delete(organization);

      await tx.delete(session);
      await tx.delete(account);
      await tx.delete(user);
    });

    const [, err] = await tryCatch(transaction);

    if (err)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al limpiar la base de datos",
        cause: err.cause,
      });
  }

  public async seedUsers(headers: Headers, values: z.infer<typeof seedUsers>) {
    const rootPromises = Array.from({
      length: values.totalRoots,
    }).map((_, index) =>
      this.authService.api.signUpEmail({
        body: {
          email: "root" + index + "@fludge.com",
          password: values.commonPassword,
          isRoot: true,
          phone: faker.phone.number(),
          name: faker.person.fullName(),
        },
        headers,
      }),
    );

    const memberPromises = Array.from({
      length: values.totalMembers,
    }).map((_, index) =>
      this.authService.api.signUpEmail({
        body: {
          email: "member" + index + "@fludge.com",
          password: values.commonPassword,
          isRoot: false,
          phone: faker.phone.number(),
          name: faker.person.fullName(),
        },
        headers,
      }),
    );

    const [, errRoots] = await tryCatch(Promise.all(rootPromises));
    const [, errMembers] = await tryCatch(Promise.all(memberPromises));

    if (errRoots || errMembers)
      throw new Error("Error al crear usuarios", {
        cause: errRoots?.cause ?? errMembers?.cause,
      });
  }

  public async seedOrganizations(values: z.infer<typeof seedOrganizations>) {
    const [allUsers, errUsers] = await tryCatch(
      this.db
        .select({
          name: user.name,
          id: user.id,
          isRoot: user.isRoot,
        })
        .from(user),
    );

    if (errUsers) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener usuarios",
        cause: errUsers.cause,
      });
    }

    const rootUsers = allUsers.filter((u) => u.isRoot);
    const members = allUsers.filter((u) => !u.isRoot);

    const totalOrganizations = rootUsers.length * values.organizationsPerUser;

    if (totalOrganizations === 0) {
      return [];
    }

    const memberChunks = chunkMembersForOrganizations(
      members,
      totalOrganizations,
    );

    const allOrganizations: Organization[] = [];

    for (const rootUser of rootUsers) {
      for (let i = 0; i < values.organizationsPerUser; i++) {
        const name = faker.company.name();

        const organization = Organization.create({
          legalName: `${name} S.A.`,
          name,
          phone: faker.phone.number(),
          taxId: faker.finance.iban(),
          address: faker.location.streetAddress(),
          owner: {
            userId: UUID.fromString(rootUser.id),
            role: "owner",
            assignedBy: null,
          },
          groups: [
            {
              name: "Administradores",
              description: "Grupo de administradores",
              permissions: Permissions.create(ALL_PERMISSIONS),
            },
          ],
        });

        const owner = organization.members.owner!;

        generateGroups(owner.id, values.groupsPerOrganization).forEach((g) =>
          organization.groups.addGroup(g),
        );

        allOrganizations.push(organization);
      }
    }

    allOrganizations.forEach((org, index) => {
      const membersToAdd = memberChunks[index] ?? [];
      if (membersToAdd.length === 0) return;

      const orgId = org.id!;
      const owner = org.members.owner!;
      const groups = org.groups?.values(orgId) ?? [];
      const toAssign = faker.helpers.arrayElements(groups);

      for (const m of membersToAdd) {
        const member = Member.create({
          userId: UUID.fromString(m.id),
          role: "member",
          assignedBy: owner.id,
        });

        org.members.addMember(member);

        for (const g of toAssign) {
          org.addGroupMember(
            GroupMember.create({
              groupId: g.id,
              memberId: member.id.toString(),
              createdBy: owner.id.toString(),
            }),
          );
        }
      }
    });

    for (const organization of allOrganizations) {
      const [, errSaving] =
        await this.organizationRepository.save(organization);

      if (errSaving) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: `Error al guardar la organización "${organization.values.name}"`,
          cause: errSaving.cause,
        });
      }
    }

    return allOrganizations.map((o) => o.values);
  }

  public async seedAll(headers: Headers, values: z.infer<typeof seedAll>) {
    await this.clear();

    await this.seedUsers(headers, values.users);

    return this.seedOrganizations(values.organizations);
  }
}
