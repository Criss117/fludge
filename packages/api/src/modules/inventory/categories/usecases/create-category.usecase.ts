import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { category } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { CreateCategorySchema } from "@fludge/utils/validators/categories.validators";

export class CreateCategoryUseCase {
  public async execute(organizationId: string, values: CreateCategorySchema) {
    const { data, error } = await tryCatch(
      db
        .insert(category)
        .values({
          name: values.name,
          description: values.description || null,
          organizationId,
        })
        .returning(),
    );

    if (error) throw new InternalServerErrorException("Algo salió mal");

    const createdCategory = data.at(0);

    if (!createdCategory)
      throw new InternalServerErrorException("No se pudo crear la categoría");

    return createdCategory;
  }
}

export const createCategoryUseCase = new CreateCategoryUseCase();
