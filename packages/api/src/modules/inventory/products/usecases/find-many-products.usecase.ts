import { desc, eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { product } from "@fludge/db/schema/product";

export class FindManyProductsUseCase {
  public async execute(organizationid: string) {
    return db
      .select()
      .from(product)
      .where(eq(product.organizationId, organizationid))
      .orderBy(desc(product.createdAt));
  }
}

export const findManyProductsUseCase = new FindManyProductsUseCase();
