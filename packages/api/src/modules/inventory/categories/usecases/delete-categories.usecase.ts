import { and, eq, inArray } from "drizzle-orm";
import { db } from "@fludge/db";
import { category } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { DeleteCategoriesSchema } from "@fludge/utils/validators/categories.validators";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class DeleteCategoriesUseCase {
  public async execute(organizationId: string, values: DeleteCategoriesSchema) {
    const { error } = await tryCatch(
      db
        .delete(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            inArray(category.id, values.ids),
          ),
        ),
    );

    if (error)
      throw new InternalServerErrorException(
        "Error al eliminar las categorías",
      );
  }
}

export const deleteCategoriesUseCase = new DeleteCategoriesUseCase();
