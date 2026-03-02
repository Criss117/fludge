import { and, eq, or, type SQL } from "drizzle-orm";
import { db } from "@fludge/db";
import { product } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { UpdateProductSchema } from "@fludge/utils/validators/products.schemas";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception";
import { ProductAlreadyExistsException } from "../exceptions/product-already-exists.exception";

export class UpdateProductUseCase {
  async execute(organizationId: string, values: UpdateProductSchema) {
    const { data: exisitingProducts, error: exisitingProductsError } =
      await tryCatch(
        db
          .select()
          .from(product)
          .where(
            and(
              eq(product.id, values.id),
              eq(product.organizationId, organizationId),
            ),
          ),
      );

    if (exisitingProductsError)
      throw new InternalServerErrorException("Error al obtener el producto");

    const exisitingProduct = exisitingProducts.at(0);

    if (!exisitingProduct) throw new ProductNotFoundException();

    if (
      (values.name && values.name !== exisitingProduct.name) ||
      (values.sku && values.sku !== exisitingProduct.sku)
    ) {
      const query: SQL[] = [];

      if (values.name) query.push(eq(product.name, values.name));

      if (values.sku) query.push(eq(product.sku, values.sku));

      const { data, error } = await tryCatch(
        db
          .select({ id: product.id })
          .from(product)
          .where(and(eq(product.organizationId, organizationId), or(...query)))
          .limit(1),
      );

      if (error)
        throw new InternalServerErrorException("Error al validar el producto");

      if (data.length)
        throw new ProductAlreadyExistsException(
          "El nombre o sku ya esta ocupado",
        );
    }

    const { data: updatedProducts, error: updateError } = await tryCatch(
      db
        .update(product)
        .set(values)
        .where(eq(product.id, values.id))
        .returning(),
    );

    if (updateError)
      throw new InternalServerErrorException("Error al actualizar el producto");

    const updatedProduct = updatedProducts.at(0);

    if (!updatedProduct)
      throw new ProductNotFoundException("El producto no fue actualizado");

    return updatedProduct;
  }
}

export const updateProductUseCase = new UpdateProductUseCase();
