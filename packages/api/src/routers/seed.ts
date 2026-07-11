import { dbConnection } from "@fludge/db";
import { publicProcedure } from "..";
import { authContainer } from "../modules/iam/auth/container";
import { faker } from "@faker-js/faker/locale/es_MX";
import type { Faker } from "@faker-js/faker";
import {
  account,
  member,
  organization,
  session,
  user,
} from "@fludge/db/schemas/auth.schema";
import { slugify } from "@fludge/utils/slugify";
import { group, groupMember } from "@fludge/db/schemas/iam.schema";
import {
  category,
  inventoryMovement,
  product,
  supplier,
  supplierProduct,
} from "@fludge/db/schemas/catalog.schema";
import { membersContainer } from "../modules/iam/members/container";
import { groupsContainer } from "../modules/iam/groups/container";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";
import { groupMembersContainer } from "../modules/iam/group-members/container";
import { categoriesContainer } from "../modules/catalog/categories/container";
import { productsContainer } from "../modules/catalog/products/container";

async function clearUsers() {
  await dbConnection.delete(session);
  await dbConnection.delete(account);
  await dbConnection.delete(user);
}

async function clearOrganizations() {
  // Catalog tables — children first, respecting FK dependencies.
  // supplierProduct → supplier (cascade from supplier)
  // inventoryMovement RESTRICT on product — must clear before product
  // product → category (set null), category → organization (cascade)
  await dbConnection.delete(supplierProduct);
  await dbConnection.delete(supplier);
  await dbConnection.delete(inventoryMovement);
  await dbConnection.delete(product);
  await dbConnection.delete(category);

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
    assignedBy: string;
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
      memberIds: [d.memberId],
      organizationId: d.organizationId,
    });
  });

  return Promise.all(promises);
}

function generateUniqueName(
  faker: Faker,
  used: Set<string>,
  generator: () => string,
  maxAttempts = 5,
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const name = generator();
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  // Guaranteed-unique fallback: append a discriminator so seeding never
  // fails on faker collisions within an org/parent scope.
  const unique = `${generator()} ${faker.string.alphanumeric(3)}`.slice(0, 50);
  used.add(unique);
  return unique;
}

async function seedCategories(
  rootMembers: Array<{ id: string; organizationId: string }>,
  faker: Faker,
): Promise<Map<string, { roots: any[]; subs: any[] }>> {
  const orgCategories = new Map<string, { roots: any[]; subs: any[] }>();

  for (const rootMember of rootMembers) {
    const { organizationId } = rootMember;
    const roots: any[] = [];
    const subs: any[] = [];
    const usedRootNames = new Set<string>();

    // 6 root categories — names unique within the org (parentId = null scope).
    const rootPromises = Array.from({ length: 6 }).map(() => {
      const name = generateUniqueName(faker, usedRootNames, () =>
        faker.commerce.department(),
      );
      return categoriesContainer.commands.create.execute({
        name,
        organizationId,
        createdBy: { memberId: rootMember.id },
      });
    });

    const createdRoots = await Promise.all(rootPromises);
    roots.push(...createdRoots);

    // 3 subcategories per root — names unique within each parent scope.
    const subPromises = createdRoots.flatMap((root) => {
      const usedSubNames = new Set<string>();
      return Array.from({ length: 3 }).map(() => {
        const name = generateUniqueName(faker, usedSubNames, () =>
          faker.commerce.productName(),
        );
        return categoriesContainer.commands.create.execute({
          name,
          parentId: root.id,
          organizationId,
          createdBy: { memberId: rootMember.id },
        });
      });
    });

    const createdSubs = await Promise.all(subPromises);
    subs.push(...createdSubs);

    orgCategories.set(organizationId, { roots, subs });
  }

  return orgCategories;
}

function generatePrices(faker: Faker) {
  const purchase = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
  return {
    pricePurchase: purchase.toFixed(2),
    priceRetail: (purchase * 1.4).toFixed(2),
    priceWholesale: (purchase * 1.2).toFixed(2),
  };
}

async function seedProducts(
  orgCategories: Map<string, { roots: any[]; subs: any[] }>,
  rootMembers: Array<{ id: string; organizationId: string }>,
  faker: Faker,
): Promise<void> {
  for (const rootMember of rootMembers) {
    const { organizationId } = rootMember;
    const { subs } = orgCategories.get(organizationId)!;
    const usedBarcodes = new Set<string>();

    // ~5 products per subcategory, fanned out in parallel per org.
    const promises = subs.flatMap((sub) =>
      Array.from({ length: 5 }).map(() => {
        let barcode = "";
        for (let i = 0; i < 5; i++) {
          const candidate = faker.string.numeric({
            length: 13,
            allowLeadingZeros: false,
          });
          if (!usedBarcodes.has(candidate)) {
            usedBarcodes.add(candidate);
            barcode = candidate;
            break;
          }
        }
        // Fallback if retry budget exhausted — append a discriminator.
        if (!barcode) {
          barcode = `${faker.string.numeric({ length: 10, allowLeadingZeros: false })}${faker.string.alphanumeric({ length: 3 })}`.slice(0, 13);
          usedBarcodes.add(barcode);
        }

        const { pricePurchase, priceRetail, priceWholesale } =
          generatePrices(faker);

        return productsContainer.commands.create.execute({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription().slice(0, 500),
          categoryId: sub.id,
          barcode,
          stockQuantity: faker.number.int({ min: 0, max: 200 }),
          minimumStock: faker.number.int({ min: 0, max: 20 }),
          allowNegativeStock: false,
          pricePurchase,
          priceRetail,
          priceWholesale,
          organizationId,
          // Products take the root member id as a plain string,
          // unlike categories which take { memberId }.
          createdBy: rootMember.id,
        });
      }),
    );

    await Promise.all(promises);
  }
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
          return {
            organizationId: m.organizationId,
            assignedBy: m.id,
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

        const inviter = rootMembers.find((r) => r.id === m.assignedBy);
        const inviterUser = inviter
          ? rootUsers.find((u) => u.id === inviter.userId)
          : undefined;

        return {
          memberId: m.id,
          organizationId: m.organizationId,
          assignedBy: {
            memberId: m.assignedBy,
            name: inviterUser?.name ?? "",
            email: inviterUser?.email ?? "",
          },
          groupIds,
        };
      });

      await seedGroupMembers(data);

      const orgCategories = await seedCategories(rootMembers, faker);
      await seedProducts(orgCategories, rootMembers, faker);

      return {
        rootUsers,
        rootMembers,
        members,
        groups,
        data,
        orgCategories,
      };
    }),
  };
