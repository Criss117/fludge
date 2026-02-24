import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { product } from "@fludge/db/schema/product";
import { tryCatch } from "@fludge/utils/try-catch";
import type { CreateProductSchema } from "@fludge/utils/validators/products.schemas";
import { and, eq, or } from "drizzle-orm";
import { ProductAlreadyExistsException } from "../exceptions/product-already-exists.exception";

export class CreateProductUseCase {
  public async execute(organizationId: string, values: CreateProductSchema) {
    //1: check sku and name
    const { data: existingProducts, error: exisitingProductsError } =
      await tryCatch(
        db
          .select()
          .from(product)
          .where(
            and(
              eq(product.organizationId, organizationId),
              or(eq(product.sku, values.sku), eq(product.name, values.name)),
            ),
          )
          .limit(1),
      );

    if (exisitingProductsError)
      throw new InternalServerErrorException("Error al crear un producto");

    if (existingProducts.length)
      throw new ProductAlreadyExistsException(
        "El nombre o SKU del producto ya esta registrado",
      );

    //2: create product
    const { data: createdProducts, error: createdProductError } =
      await tryCatch(
        db
          .insert(product)
          .values({ ...values, organizationId })
          .returning(),
      );

    if (createdProductError)
      throw new InternalServerErrorException("Error al crear un producto");

    const createdProduct = createdProducts.at(0);

    if (!createdProduct)
      throw new InternalServerErrorException("Error al crear un producto");

    return createdProduct;
  }
}

export const createProductUseCase = new CreateProductUseCase();
