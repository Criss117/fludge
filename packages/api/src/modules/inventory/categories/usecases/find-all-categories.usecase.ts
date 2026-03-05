import { desc, eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { category } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class FindAllCategoriesUseCase {
  public async execute(organizationId: string) {
    const { data, error } = await tryCatch(
      db
        .select()
        .from(category)
        .where(eq(category.organizationId, organizationId))
        .orderBy(desc(category.createdAt)),
    );

    if (error) throw new InternalServerErrorException("Algo salió mal");

    return data;
  }
}

export const findAllCategoriesUseCase = new FindAllCategoriesUseCase();
