import type { DatabaseService } from "@fludge/db";
import {
  sale,
  saleItem,
  saleSequences,
} from "@fludge/db/schema/sales.schema";
import { customer, customerPayment } from "@fludge/db/schema/customer.schema";
import { member, organization } from "@fludge/db/schema/iam.schema";
import { product, productPresentation } from "@fludge/db/schema/catalog.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { tryCatch } from "@fludge/utils/trycatch";
import { UUID } from "@fludge/utils/uuid";
import type { seedCommerceValidator } from "@fludge/utils/validators/seed.validators";
import { eq, getColumns, sql } from "drizzle-orm";
import type { z } from "zod";
import { batchInsert } from "./batch-insert";

type SeedCommerceInput = z.infer<typeof seedCommerceValidator>;

type PresentationLite = {
  id: string;
  name: string;
  barcode: string | null;
  conversionFactor: number;
  productId: string;
};

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  presentations: PresentationLite[];
};

export class SeedCommerceService {
  constructor(private readonly db: DatabaseService) {}

  public async seed(input: SeedCommerceInput) {
    // 1. Obtener organizaciones con owner member
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

    // 2. Obtener productos con presentaciones por org
    const [productRows, errProds] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          presentations: sql<string>`
            json_group_array(
              json_object(
                'id', ${productPresentation.id},
                'name', ${productPresentation.name},
                'barcode', ${productPresentation.barcode},
                'conversionFactor', ${productPresentation.conversionFactor},
                'productId', ${productPresentation.productId}
              )
            ) FILTER (WHERE ${productPresentation.productId} IS NOT NULL)
          `.as("presentations"),
        })
        .from(product)
        .leftJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(eq(product.status, "active"))
        .groupBy(product.id),
    );
    if (errProds)
      throw new Error("Error fetching products", { cause: errProds });

    const productsByOrg = new Map<string, ProductLite[]>();
    for (const row of productRows) {
      const presentations = JSON.parse(row.presentations) as PresentationLite[];
      const productLite: ProductLite = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        presentations: presentations.filter((p) => p.id),
      };

      if (productLite.presentations.length === 0) continue;

      const orgProducts = productsByOrg.get(row.organizationId) ?? [];
      orgProducts.push(productLite);
      productsByOrg.set(row.organizationId, orgProducts);
    }

    // 3. Preparar clientes
    const customersToInsert: (typeof customer.$inferInsert)[] = [];
    const customersByOrg = new Map<string, typeof customersToInsert>();

    for (const [orgIdx, org] of orgsWithOwners.entries()) {
      const orgCustomers: (typeof customer.$inferInsert)[] = [];

      for (let i = 0; i < input.customersPerOrganization; i++) {
        const docNumber = `${String(orgIdx).padStart(2, "0")}${String(i).padStart(8, "0")}`;

        const customerRow = {
          id: UUID.generate().toString(),
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          email: `customer-${org.orgId.slice(0, 4)}-${i}@example.com`,
          creditLimit: faker.number.int({ min: 100_000, max: 5_000_000 }),
          balance: 0,
          documentType: faker.helpers.arrayElement(["CC", "NIT", "CE"]),
          documentNumber: docNumber,
          organizationId: org.orgId,
          createdBy: org.ownerMemberId,
        };

        customersToInsert.push(customerRow);
        orgCustomers.push(customerRow);
      }

      customersByOrg.set(org.orgId, orgCustomers);
    }

    // 4. Batch insert customers
    if (customersToInsert.length > 0) {
      const [, errCust] = await tryCatch(
        batchInsert(this.db, customer, customersToInsert),
      );
      if (errCust)
        throw new Error("Error inserting customers", { cause: errCust });
    }

    // 5. Preparar ventas
    const salesToInsert: (typeof sale.$inferInsert)[] = [];
    const salesByCustomer = new Map<string, typeof salesToInsert>();
    const saleSequenceCounters = new Map<string, number>();

    const today = new Date();
    const dateSuffix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    for (const org of orgsWithOwners) {
      const orgCustomers = customersByOrg.get(org.orgId) ?? [];
      const orgProducts = productsByOrg.get(org.orgId) ?? [];

      for (const cust of orgCustomers) {
        const custSales: (typeof sale.$inferInsert)[] = [];

        for (let i = 0; i < input.salesPerCustomer; i++) {
          if (orgProducts.length === 0) break;

          const saleId = UUID.generate().toString();
          const paymentType = faker.helpers.arrayElement(["cash", "credit"]);

          const seqKey = org.orgId;
          const currentSeq = saleSequenceCounters.get(seqKey) ?? 0;
          const nextSeq = currentSeq + 1;
          saleSequenceCounters.set(seqKey, nextSeq);

          const saleRow: typeof sale.$inferInsert = {
            id: saleId,
            saleNumber: `SL-${dateSuffix}-${String(nextSeq).padStart(5, "0")}`,
            paymentType,
            customerId: cust.id,
            total: 0,
            totalPaid: paymentType === "cash" ? 0 : 0,
            status: paymentType === "cash" ? "completed" : "open",
            completedAt: paymentType === "cash" ? new Date() : null,
            notes: faker.lorem.sentence(),
            organizationId: org.orgId,
            createdBy: org.ownerMemberId,
          };

          salesToInsert.push(saleRow);
          custSales.push(saleRow);
        }

        salesByCustomer.set(cust.id!, custSales);
      }
    }

    // 6. Preparar items y calcular totales de ventas
    const saleItemsToInsert: (typeof saleItem.$inferInsert)[] = [];
    const saleTotals = new Map<string, number>();

    for (const org of orgsWithOwners) {
      const orgProducts = productsByOrg.get(org.orgId) ?? [];
      if (orgProducts.length === 0) continue;

      const orgCustomers = customersByOrg.get(org.orgId) ?? [];
      for (const cust of orgCustomers) {
        const custSales = salesByCustomer.get(cust.id!) ?? [];

        for (const saleRow of custSales) {
          let saleTotal = 0;

          for (let i = 0; i < input.itemsPerSale; i++) {
            const product = faker.helpers.arrayElement(orgProducts);
            const presentation = faker.helpers.arrayElement(
              product.presentations,
            );
            const quantity = faker.number.int({ min: 1, max: 10 });
            const unitPrice = faker.number.int({ min: 1000, max: 500_000 });
            const subtotal = unitPrice * quantity;
            saleTotal += subtotal;

            saleItemsToInsert.push({
              id: UUID.generate().toString(),
              saleId: saleRow.id!,
              productId: product.id,
              productPresentationId: presentation.id,
              productSnapshot: {
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                },
                presentation: {
                  id: presentation.id,
                  name: presentation.name,
                  barcode: presentation.barcode,
                  conversionFactor: presentation.conversionFactor,
                },
              },
              name: presentation.name,
              unitPrice,
              quantity,
              subtotal,
              organizationId: org.orgId,
            });
          }

          saleTotals.set(saleRow.id!, saleTotal);
        }
      }
    }

    // 7. Actualizar totales en las ventas
    for (const saleRow of salesToInsert) {
      const total = saleTotals.get(saleRow.id!) ?? 0;
      saleRow.total = total;
      if (saleRow.paymentType === "cash") {
        saleRow.totalPaid = total;
      }
    }

    // 8. Batch insert sales
    if (salesToInsert.length > 0) {
      const [, errSales] = await tryCatch(
        batchInsert(this.db, sale, salesToInsert),
      );
      if (errSales)
        throw new Error("Error inserting sales", { cause: errSales });
    }

    // 9. Batch insert sale items
    if (saleItemsToInsert.length > 0) {
      const [, errItems] = await tryCatch(
        batchInsert(this.db, saleItem, saleItemsToInsert),
      );
      if (errItems)
        throw new Error("Error inserting sale items", { cause: errItems });
    }

    // 10. Actualizar secuencias
    const sequencesToInsert: (typeof saleSequences.$inferInsert)[] = [];
    for (const [orgId, count] of saleSequenceCounters) {
      sequencesToInsert.push({
        organizationId: orgId,
        year: today.getFullYear(),
        currentValue: count,
      });
    }

    if (sequencesToInsert.length > 0) {
      const [, errSeq] = await tryCatch(
        this.db
          .insert(saleSequences)
          .values(sequencesToInsert)
          .onConflictDoUpdate({
            target: [saleSequences.organizationId, saleSequences.year],
            set: {
              currentValue: sql`${saleSequences.currentValue} + excluded.current_value`,
            },
          }),
      );
      if (errSeq)
        throw new Error("Error updating sale sequences", { cause: errSeq });
    }

    return {
      organizationsUsed: orgsWithOwners.length,
      customersCreated: customersToInsert.length,
      salesCreated: salesToInsert.length,
      saleItemsCreated: saleItemsToInsert.length,
    };
  }

  public async clearCommerceTables(): Promise<void> {
    const [, err] = await tryCatch(
      this.db.transaction(async (tx) => {
        await tx.delete(saleItem);
        await tx.delete(sale);
        await tx.delete(customerPayment);
        await tx.delete(customer);
        await tx.delete(saleSequences);
      }),
    );

    if (err)
      throw new Error("Error clearing commerce tables", { cause: err });
  }
}
