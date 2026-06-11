import { dbConnection } from "@fludge/db";
import { publicProcedure } from "..";
import { authContainer } from "../modules/iam/auth/container";
import { faker } from "@faker-js/faker/locale/es_MX";
import {
  account,
  member,
  organization,
  session,
  user,
} from "@fludge/db/schemas/auth.schema";
import { slugify } from "@fludge/utils/slugify";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import { membersContainer } from "../modules/iam/members/container";
import { groupsContainer } from "../modules/iam/groups/container";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";
import { groupMembersContainer } from "../modules/iam/group-members/container";

async function clearUsers() {
  await dbConnection.delete(session);
  await dbConnection.delete(account);
  await dbConnection.delete(user);
}

async function clearOrganizations() {
  await dbConnection.delete(groupMember);
  await dbConnection.delete(group);
  await dbConnection.delete(member);
  await dbConnection.delete(organization);
}

const rootUsers = Array.from({ length: 3 }).map((_, index) => {
  return {
    email: `cristian${index + 1}@fludge.dev`,
    password: "holiwiss",
    name: `Cristian ${index + 1} Viveros`,
    phone: faker.phone.number(),
  };
});

const memberUsers = Array.from({ length: 20 }).map((_, index) => {
  return {
    email: `sary${index + 1}@fludge.dev`,
    password: "holiwiss",
    name: `Sary ${index + 1} Yineth`,
    phone: faker.phone.number(),
  };
});

function organizations(
  rootUsers: { userId: string; name: string; email: string }[],
) {
  return rootUsers.map((user) => {
    const name = faker.company.name();
    const organizationId = crypto.randomUUID();

    return {
      id: organizationId,
      name: name,
      slug: slugify(name),
      createdAt: new Date(),
      legalName: name + " LLC",
      taxId: faker.commerce.isbn(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      member: {
        userId: user.userId,
        organizationId,
        role: "owner",
      },
    };
  });
}

async function seedRooUsers(headers: Headers) {
  const promises = rootUsers.map((user) =>
    authContainer.commands.signUpEmail
      .execute(user, headers)
      .then((d) => d.user),
  );
  return Promise.all(promises);
}

async function seedMemberUsers(
  data: {
    organizationId: string;
    assignedBy: {
      memberId: string;
      name: string;
      email: string;
    };
  }[],
  headers: Headers,
) {
  const promises = memberUsers.map((user) => {
    const orgData = faker.helpers.arrayElement(data);

    return membersContainer.commands.register.execute(
      {
        ...user,
        organizationId: orgData.organizationId,
        assignedBy: orgData.assignedBy,
      },
      headers,
    );
  });

  return Promise.all(promises);
}

async function seedOrganizations(
  rootUsers: { userId: string; name: string; email: string }[],
) {
  const orgs = organizations([...rootUsers, ...rootUsers]);

  await dbConnection.insert(organization).values(orgs).returning();

  return dbConnection
    .insert(member)
    .values(
      orgs.map((o) => ({
        ...o.member,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      })),
    )
    .returning();
}

async function seedGroups(
  data: {
    organizationId: string;
    createdBy: {
      memberId: string;
      name: string;
      email: string;
    };
  }[],
) {
  const adminGroups = data.map((d) =>
    groupsContainer.commands.create.execute({
      name: "Administradores",
      organizationId: d.organizationId,
      createdBy: d.createdBy,
      permissions: ALL_PERMISSIONS,
      description: faker.lorem.sentence(),
    }),
  );

  const promises = data.map((d) => {
    const permissions = faker.helpers.arrayElements(ALL_PERMISSIONS);

    return groupsContainer.commands.create.execute({
      name: faker.lorem.word(),
      organizationId: d.organizationId,
      createdBy: d.createdBy,
      permissions,
      description: faker.lorem.sentence(),
    });
  });

  return Promise.all([...adminGroups, ...promises]);
}

async function seedGroupMembers(
  data: {
    groupIds: string[];
    memberId: string;
    organizationId: string;
    assignedBy: {
      memberId: string;
      name: string;
      email: string;
    };
  }[],
) {
  const promises = data.map((d) => {
    return groupMembersContainer.commands.assignMembers.execute({
      assignedBy: d.assignedBy,
      groupIds: d.groupIds,
      memberId: d.memberId,
      organizationId: d.organizationId,
    });
  });

  return Promise.all(promises);
}

export const seedRouter = {
  clear: publicProcedure
    .route({
      method: "POST",
      path: "/seed/clear",
      tags: ["Seed"],
    })
    .handler(async () => {
      await clearOrganizations();
      await clearUsers();
    }),

  seed: publicProcedure
    .route({
      method: "POST",
      path: "/seed",
      tags: ["Seed"],
    })
    .handler(async ({ context }) => {
      await clearOrganizations();
      await clearUsers();

      const rootUsers = await seedRooUsers(context.headers);

      const rootMembers = await seedOrganizations(
        rootUsers.map((u) => ({
          userId: u.id,
          name: u.name,
          email: u.email,
        })),
      );

      const members = await seedMemberUsers(
        rootMembers.map((m) => {
          const user = rootUsers.find((u) => u.id === m.userId)!;
          return {
            organizationId: m.organizationId,
            assignedBy: {
              memberId: m.id,
              name: user.name,
              email: user.email,
            },
          };
        }),
        context.headers,
      );

      const groups = await seedGroups(
        rootMembers.map((m) => ({
          organizationId: m.organizationId,
          createdBy: {
            memberId: m.id,
            name: rootUsers.find((u) => u.id === m.userId)!.name,
            email: rootUsers.find((u) => u.id === m.userId)!.email,
          },
        })),
      );

      const data = members.map((m) => {
        const orgGroups = groups.filter(
          (g) => g.organizationId === m.organizationId,
        );

        const groupIds = faker.helpers
          .arrayElements(orgGroups)
          .map((g) => g.id);

        return {
          memberId: m.id,
          organizationId: m.organizationId,
          assignedBy: m.assignedBy,
          groupIds,
        };
      });

      await seedGroupMembers(data);

      return {
        rootUsers,
        rootMembers,
        members,
        groups,
        data,
      };
    }),
};
