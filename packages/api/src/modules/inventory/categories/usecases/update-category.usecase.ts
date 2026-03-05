import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { category } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { UpdateCategorySchema } from "@fludge/utils/validators/categories.validators";
import { and, eq } from "drizzle-orm";
import { CategoryNotFoundException } from "../exceptions/category-not-found.exception";
import { CategoryAlreadyExistsException } from "../exceptions/category-already-exists.exception";

export class UpdateCategoryUseCase {
  public async execute(organizationId: string, values: UpdateCategorySchema) {
    const { data, error } = await tryCatch(
      db
        .select({
          name: category.name,
          description: category.description,
        })
        .from(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, values.id),
          ),
        ),
    );

    if (error)
      throw new InternalServerErrorException(
        "Algo salió mal al buscar la categoría",
      );

    const existingCategory = data.at(0);

    if (!existingCategory) throw new CategoryNotFoundException();

    if (values.name && values.name !== existingCategory.name) {
      const { data, error } = await tryCatch(
        db
          .select({ id: category.id })
          .from(category)
          .where(
            and(
              eq(category.organizationId, organizationId),
              eq(category.name, values.name),
            ),
          )
          .limit(1),
      );

      if (error)
        throw new InternalServerErrorException(
          "Algo salió mal al buscar la categoría",
        );

      if (data.length) throw new CategoryAlreadyExistsException();
    }

    const newDescription =
      values.description === undefined
        ? existingCategory.description
        : values.description === ""
          ? null
          : values.description;

    const { data: updatedCategories, error: updateError } = await tryCatch(
      db
        .update(category)
        .set({
          name: values.name ?? existingCategory.name,
          description: newDescription,
        })
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, values.id),
          ),
        )
        .returning(),
    );

    if (updateError)
      throw new InternalServerErrorException(
        "Algo salió mal al actualizar la categoría",
      );

    const updatedCategory = updatedCategories.at(0);

    if (!updatedCategory)
      throw new InternalServerErrorException(
        "Algo salió mal al actualizar la categoría",
      );

    return updatedCategory;
  }
}

export const updateCategoryUseCase = new UpdateCategoryUseCase();
