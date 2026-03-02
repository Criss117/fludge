import { baseProcedure } from "@fludge/api";
import { db } from "@fludge/db";
import { account, user } from "@fludge/db/schema/auth";
import { faker } from "@faker-js/faker/locale/es";
import { slugify } from "@fludge/utils/slugify";
import { allPermissions } from "@fludge/utils/validators/permission.schemas";
import { product } from "@fludge/db/schema/product";
import { member, organization, team } from "@fludge/db/schema/organization";

type User = typeof user.$inferSelect;
type Organization = typeof organization.$inferSelect;

async function seedRootUsers(quantity = 5) {
  const rootUsers = Array.from({
    length: quantity,
  }).map((_, index) => ({
    address: faker.location.streetAddress(),
    cc: faker.finance.accountNumber(),
    email: `root${index}@fludge.dev`,
    is_root: true,
    name: faker.person.fullName(),
    id: faker.string.uuid(),
  }));

  const createdUsers = await db.insert(user).values(rootUsers).returning();

  const accounts = createdUsers.map((user) => ({
    id: faker.string.uuid(),
    userId: user.id,
    accountId: user.id,
    providerId: "credential",
    password:
      "2d651df56fc8376498785a8d90ec1c06:d10e3d93a8def9af10193160e6bafdcbc4ec3cf98a0985a2258f6323ab6dbe01d6f76a5549d884f685e0ed429a425269b0f4801f3dfe6b4e3e6d21b9148a9216",
  }));

  const createdAccounts = await db.insert(account).values(accounts).returning();

  return {
    users: createdUsers,
    accounts: createdAccounts,
  };
}

async function seedOrganizations(rootUsers: User[], quantityPerUser = 2) {
  const organizations = rootUsers
    .map((user) =>
      Array.from({ length: quantityPerUser }).map(() => {
        const name = faker.company.name();

        return {
          user: user,
          values: {
            address: faker.location.streetAddress(),
            legalName: faker.company.name(),
            name,
            slug: slugify(name),
            createdAt: new Date(),
            contactEmail: faker.internet.email(),
            contactPhone: faker.phone.number(),
            rootUserId: user.id,
          },
        };
      }),
    )
    .flat();

  const createdOrgs = await db
    .insert(organization)
    .values(organizations.map((o) => o.values))
    .returning();

  const rootMembers = createdOrgs.map((org, index) => {
    const user = rootUsers[index];
    if (!user) return null;

    return {
      userId: user.id,
      organizationId: org.id,
      role: "owner",
      createdAt: new Date(),
    };
  });

  await db.insert(member).values(rootMembers.filter((r) => r !== null));

  return createdOrgs;
}

async function seedTeams(
  organizations: Organization[],
  quantityPerOrganization = 5,
) {
  const teams = organizations
    .map((org) =>
      Array.from({
        length: quantityPerOrganization,
      }).map(() => ({
        createdAt: new Date(),
        name: faker.company.name(),
        organizationId: org.id,
        permissions: faker.helpers.arrayElements(allPermissions),
        description: faker.company.catchPhrase(),
      })),
    )
    .flat();

  const createdTeams = await db.insert(team).values(teams).returning();

  return createdTeams;
}

async function seedProducts(
  organizations: Organization[],
  quantityPerOrganization = 50,
) {
  const products = organizations
    .map((org) =>
      Array.from({ length: quantityPerOrganization }).map(() => {
        const costPrice = Math.random() * 10000;
        const salePrice = costPrice * (1 + Math.random() * 0.5);
        const wholesalePrice = costPrice * (1 - Math.random() * 0.2);
        const stock = Math.floor(Math.random() * 100);
        const minStock = Math.floor(stock * 0.1);

        return {
          name: faker.commerce.product(),
          organizationId: org.id,
          sku: faker.commerce.isbn(),
          wholesalePrice: Math.floor(wholesalePrice),
          salePrice: Math.floor(salePrice),
          costPrice: Math.floor(costPrice),
          stock,
          minStock,
        };
      }),
    )
    .flat();

  return await db.insert(product).values(products).returning();
}

export const seedProcedures = baseProcedure({
  method: "GET",
  tags: ["seed"],
}).handler(async () => {
  const { users, accounts } = await seedRootUsers(2);

  const organizations = await seedOrganizations(users);

  const teams = await seedTeams(organizations);
  const products = await seedProducts(organizations, 100);

  return {
    users,
    accounts,
    organizations,
    teams,
    products,
  };
});
