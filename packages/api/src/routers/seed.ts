import { dbConnection } from "@fludge/db";
import { publicProcedure } from "..";
import { authContainer } from "../modules/iam/auth/container";
import { member, organization } from "@fludge/db/schemas/auth.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { slugify } from "@fludge/utils/slugify";
import { membersContainer } from "../modules/iam/members/container";
import { groupsContainer } from "../modules/iam/groups/container";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";

function generateOrgnization(rootUserIds: string | string[]) {
  if (!Array.isArray(rootUserIds)) rootUserIds = [rootUserIds];

  return [...rootUserIds, ...rootUserIds].map((id, index) => {
    const name = faker.company.name();

    return {
      id: crypto.randomUUID(),
      name: name,
      slug: slugify(name),
      legalName: name + " Ltd.",
      taxId: faker.finance.iban(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      createdAt: new Date(new Date().getTime() + index * 1000 * 60 * 60 * 24),
      rootUserId: id,
    };
  });
}

function generateUsers(count: number) {
  return Array.from({ length: count }, (_, index) => {
    return {
      email: `cristian${index + 1}@fludge.dev`,
      password: "holiwiss",
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    };
  });
}

async function insertGroups(
  data: {
    orgId: string;
    rootMemberId: string;
  }[],
) {
  const groupsPromises = data.map(({ orgId, rootMemberId }) => {
    return groupsContainer.commands.create
      .execute({
        name: "Administradores",
        organizationId: orgId,
        permissions: ALL_PERMISSIONS,
        changedByMemberId: rootMemberId,
        description: "Grupo de administradores",
      })
      .then((g) => ({
        ...g,
        organizationId: orgId,
      }));
  });

  const d = await Promise.all(groupsPromises);

  return d;
}

async function insertGroupMembers(
  data: {
    groupId: string;
    memberIds: string[];
    assignedBy: string;
    orgId: string;
  }[],
) {
  const groupMembersPromises = data.map(
    ({ groupId, memberIds, assignedBy, orgId }) => {
      return groupsContainer.commands.assignMembers.execute({
        groupId,
        memberIds,
        changedByMemberId: assignedBy,
        organizationId: orgId,
      });
    },
  );

  await Promise.all(groupMembersPromises);
}

export const seedRouter = {
  createUsers: publicProcedure
    .route({
      method: "POST",
      path: "/seed/create-users",
      tags: ["seed"],
    })
    .handler(async ({ context }) => {
      const users = generateUsers(12);

      const rootUser = users.slice(0, 2);
      const members = users.slice(2);

      const rootUserPromise = rootUser.map((user) =>
        authContainer.commands.signUpEmail.execute(
          {
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone,
          },
          context.headers,
        ),
      );

      const rootUsers = await Promise.all(rootUserPromise);

      const orgs = generateOrgnization(rootUsers.map((u) => u.user.id));

      const rootMembers = await dbConnection.transaction(async (trx) => {
        await trx.insert(organization).values(
          orgs.map((o) => ({
            id: o.id,
            name: o.name,
            slug: o.slug,
            legalName: o.legalName,
            taxId: o.taxId,
            address: o.address,
            phone: o.phone,
            createdAt: o.createdAt,
            rootUserId: o.rootUserId,
          })),
        );

        return trx
          .insert(member)
          .values(
            orgs.map((o) => ({
              id: crypto.randomUUID(),
              organizationId: o.id,
              userId: o.rootUserId,
              role: "owner",
              createdAt: o.createdAt,
            })),
          )
          .returning();
      });

      const membersPromises = members.map((member) => {
        const org = faker.helpers.arrayElement(orgs);

        const rootMember = rootMembers.find(
          (m) => m.organizationId === org.id,
        )!;

        return membersContainer.commands.signUpMember
          .execute(
            {
              email: member.email,
              password: member.password,
              name: member.name,
              phone: member.phone,
              organizationId: org.id,
              assignedByMemberId: rootMember.id,
            },
            context.headers,
          )
          .then((m) => ({
            ...m,
            organizationId: org.id,
            assignedByMemberId: rootMember.id,
          }));
      });

      const insertedGroups = await insertGroups(
        orgs.map((o) => ({
          orgId: o.id,
          rootMemberId: rootMembers.find((m) => m.organizationId === o.id)!.id,
        })),
      );

      const membersCreated = await Promise.all(membersPromises);

      await insertGroupMembers(
        insertedGroups.map((g) => {
          const members = membersCreated.filter(
            (m) => m.organizationId === g.organizationId,
          );

          return {
            groupId: g.id,
            orgId: g.organizationId,
            assignedBy: g.createdBy!,
            memberIds: members.map((m) => m.memberId),
          };
        }),
      );
    }),
} as const;
