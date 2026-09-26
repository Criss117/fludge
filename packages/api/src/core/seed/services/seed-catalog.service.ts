import type { DatabaseService } from "@fludge/db";
import {
  category,
  product,
  productPresentation,
} from "@fludge/db/schema/catalog.schema";
import { member, organization } from "@fludge/db/schema/iam.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { SearchBlob } from "@fludge/utils/search-blob";
import { Slug } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/trycatch";
import { UUID } from "@fludge/utils/uuid";
import type { seedCatalogValidator } from "@fludge/utils/validators/seed.validators";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { batchInsert } from "./batch-insert";

type SeedCatalogInput = z.infer<typeof seedCatalogValidator>;

export class SeedCatalogService {
  constructor(private readonly db: DatabaseService) {}

  public async seed(input: SeedCatalogInput) {
    // 1. Obtener organizaciones con su owner member
    const [orgsWithOwners, errOrgs] = await tryCatch(
      this.db
        .select({
          orgId: organization.id,
          ownerMemberId: member.id,
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(eq(member.role, "owner")),
    );
    if (errOrgs)
      throw new Error("Error fetching organizations", { cause: errOrgs });
    if (orgsWithOwners.length === 0) {
      throw new Error(
        "No organizations with owner members found. Run seedIam first.",
      );
    }

    // 2. Preparar categorías
    const categoriesToInsert: (typeof category.$inferInsert)[] = [];
    const categoriesByOrg = new Map<string, typeof categoriesToInsert>();

    for (const [orgIdx, org] of orgsWithOwners.entries()) {
      const orgCategories: (typeof category.$inferInsert)[] = [];

      for (let i = 0; i < input.categoriesPerOrganization; i++) {
        const catId = UUID.generate().toString();
        const catName = `Categoría ${orgIdx}-${i}`;

        const catRow = {
          id: catId,
          name: catName,
          slug: new Slug(catName).toString(),
          description: faker.lorem.sentence(),
          createdBy: org.ownerMemberId,
          organizationId: org.orgId,
        };

        categoriesToInsert.push(catRow);
        orgCategories.push(catRow);
      }

      categoriesByOrg.set(org.orgId, orgCategories);
    }

    // 3. Batch insert categorías
    if (categoriesToInsert.length > 0) {
      const [, errCats] = await tryCatch(
        batchInsert(this.db, category, categoriesToInsert),
      );
      if (errCats)
        throw new Error("Error inserting categories", { cause: errCats });
    }

    // 4. Preparar productos
    const productsToInsert: (typeof product.$inferInsert)[] = [];
    const productsByOrg = new Map<string, (typeof product.$inferInsert)[]>();
    let barcodeCounter = 1_000_000_000_000;

    for (const [orgIdx, org] of orgsWithOwners.entries()) {
      const orgCats = categoriesByOrg.get(org.orgId) ?? [];
      const orgProducts: (typeof product.$inferInsert)[] = [];

      for (let i = 0; i < input.productsPerOrganization; i++) {
        const productId = UUID.generate().toString();
        const productName = `Producto ${orgIdx}-${i}`;

        const barcodes = Array.from(
          { length: input.presentationsPerProduct },
          () => String(barcodeCounter++).padStart(13, "0"),
        );

        const searchBlob = new SearchBlob(productName, ...barcodes).value;

        const categoryId = orgCats.length > 0 ? orgCats[i % orgCats.length].id : null;

        const productRow = {
          id: productId,
          name: productName,
          slug: new Slug(productName).toString(),
          searchBlob,
          description: faker.commerce.productDescription(),
          stock: faker.number.int({ min: 10, max: 500 }),
          minStock: faker.number.int({ min: 1, max: 20 }),
          allowNegativeStock: false,
          categoryId,
          createdBy: org.ownerMemberId,
          organizationId: org.orgId,
        };

        productsToInsert.push(productRow);
        orgProducts.push(productRow);
      }

      productsByOrg.set(org.orgId, orgProducts);
    }

    // 5. Batch insert productos
    if (productsToInsert.length > 0) {
      const [, errProds] = await tryCatch(
        batchInsert(this.db, product, productsToInsert),
      );
      if (errProds)
        throw new Error("Error inserting products", { cause: errProds });
    }

    // 6. Preparar presentaciones
    const presentationsToInsert: (typeof productPresentation.$inferInsert)[] =
      [];
    let presBarcodeCounter = 1_000_000_000_000;

    for (const [orgIdx, org] of orgsWithOwners.entries()) {
      const orgProducts = productsByOrg.get(org.orgId) ?? [];

      for (const [prodIdx, prod] of orgProducts.entries()) {
        for (let i = 0; i < input.presentationsPerProduct; i++) {
          const presentationName = i === 0 ? "Unidad" : `Presentación ${i + 1}`;

          presentationsToInsert.push({
            id: UUID.generate().toString(),
            productId: prod.id!,
            name: `${presentationName} ${orgIdx}-${prodIdx}-${i}`,
            barcode: String(presBarcodeCounter++).padStart(13, "0"),
            conversionFactor: i + 1,
            priceSale: faker.number.int({ min: 1000, max: 500_000 }),
            pricePurchase: faker.number.int({ min: 500, max: 400_000 }),
            priceWholesale: faker.number.int({ min: 800, max: 450_000 }),
            createdBy: org.ownerMemberId,
            organizationId: org.orgId,
          });
        }
      }
    }

    // 7. Batch insert presentaciones
    if (presentationsToInsert.length > 0) {
      const [, errPres] = await tryCatch(
        batchInsert(this.db, productPresentation, presentationsToInsert),
      );
      if (errPres)
        throw new Error("Error inserting product presentations", {
          cause: errPres,
        });
    }

    return {
      organizationsUsed: orgsWithOwners.length,
      categoriesCreated: categoriesToInsert.length,
      productsCreated: productsToInsert.length,
      presentationsCreated: presentationsToInsert.length,
    };
  }

  public async clearCatalogTables(): Promise<void> {
    const [, err] = await tryCatch(
      this.db.transaction(async (tx) => {
        await tx.delete(productPresentation);
        await tx.delete(product);
        await tx.delete(category);
      }),
    );

    if (err)
      throw new Error("Error clearing catalog tables", { cause: err });
  }


}
