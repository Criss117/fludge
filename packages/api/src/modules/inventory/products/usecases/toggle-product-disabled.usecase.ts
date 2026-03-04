import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@fludge/db";
import { BadRequestException } from "@fludge/api/modules/shared/exceptions/badrequest.exception";
import { product } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { DeleteProductsSchema } from "@fludge/utils/validators/products.schemas";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception";

export class ToggleProductDisabledUseCase {
  public async execute(organizationId: string, values: DeleteProductsSchema) {
    const uniqueIds = [...new Set(values.map((v) => v.id))];

    if (uniqueIds.length !== values.length)
      throw new BadRequestException("Los datos no son validos");

    const { data, error: findProductsError } = await tryCatch(
      db
        .select({
          id: product.id,
        })
        .from(product)
        .where(
          and(
            eq(product.organizationId, organizationId),
            inArray(
              product.id,
              values.map((v) => v.id),
            ),
          ),
        ),
    );

    if (findProductsError)
      throw new InternalServerErrorException(
        "Ocurrio un error al buscar los productos",
      );

    if (data.length !== uniqueIds.length)
      throw new ProductNotFoundException(
        "Algunos productos no fueron encontrados",
      );

    const { data: deletedProducts, error: deletedProductError } =
      await tryCatch(
        db
          .update(product)
          .set({
            isActive: sql`NOT ${product.isActive}`,
          })
          .where(
            and(
              eq(product.organizationId, organizationId),
              inArray(product.id, uniqueIds),
            ),
          )
          .returning(),
      );

    if (deletedProductError)
      throw new InternalServerErrorException(
        "Ocurrio un error al eliminar los productos",
      );

    if (deletedProducts.length !== uniqueIds.length)
      throw new InternalServerErrorException(
        "Ocurrio un error al eliminar los productos",
      );

    return deletedProducts;
  }
}

export const toggleProductDisabledUseCase = new ToggleProductDisabledUseCase();
