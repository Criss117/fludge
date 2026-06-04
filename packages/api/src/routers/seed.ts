import { dbConnection } from "@fludge/db";
import { publicProcedure } from "..";
import { authContainer } from "../modules/iam/auth/container";
import { member, organization } from "@fludge/db/schemas/auth.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { slugify } from "@fludge/utils/slugify";

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

function generateRootUsers(count: number) {
  return Array.from({ length: count }, (_, index) => {
    return {
      email: `cristian${index}@fludge.dev`,
      password: "holiwiss",
      name: "Cristian Vivieros",
      phone: "123456789",
    };
  });
}

export const seedRouter = {
  createUsers: publicProcedure
    .route({
      method: "POST",
      path: "/seed/create-users",
      tags: ["seed"],
    })
    .handler(async ({ context }) => {
      const cristianUserPromise = authContainer.commands.signUpEmail.execute(
        {
          email: "cristian@fludge.dev",
          password: "holiwiss",
          name: "Cristian Vivieros",
          phone: "123456789",
        },
        context.headers,
      );

      const saryUserPromise = authContainer.commands.signUpEmail.execute(
        {
          email: "sary@fludge.dev",
          password: "holiwiss",
          name: "Sary Yineth",
          phone: "123456789",
        },
        context.headers,
      );

      const [cristianUser, saryUser] = await Promise.all([
        cristianUserPromise,
        saryUserPromise,
      ]);

      const orgs = generateOrgnization([
        cristianUser.user.id,
        saryUser.user.id,
      ]);
      await dbConnection.transaction(async (trx) => {
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

        await trx.insert(member).values(
          orgs.map((o) => ({
            id: crypto.randomUUID(),
            organizationId: o.id,
            userId: cristianUser.user.id,
            role: "owner",
            createdAt: o.createdAt,
          })),
        );
      });
    }),
} as const;
