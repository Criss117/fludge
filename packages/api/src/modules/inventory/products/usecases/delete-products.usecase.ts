import { and, eq, inArray } from "drizzle-orm";
import { db } from "@fludge/db";
import { product } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { DeleteProductsSchema } from "@fludge/utils/validators/products.schemas";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception";
import { BadRequestException } from "@fludge/api/modules/shared/exceptions/badrequest.exception";

export class DeleteProductsUseCase {
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

    const { data: deletedProduct, error: deletedProductError } = await tryCatch(
      db
        .delete(product)
        .where(
          and(
            eq(product.organizationId, organizationId),
            inArray(product.id, uniqueIds),
          ),
        ),
    );

    if (deletedProductError)
      throw new InternalServerErrorException(
        "Ocurrio un error al eliminar los productos",
      );

    if (deletedProduct.rowsAffected !== uniqueIds.length)
      throw new InternalServerErrorException(
        "Ocurrio un error al eliminar los productos",
      );
  }
}

export const deleteProductsUseCase = new DeleteProductsUseCase();
