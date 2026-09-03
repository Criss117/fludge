import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { z } from "zod";
import { deleteProductValidator } from "@fludge/utils/validators/product.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";

export const deleteProductCommand = deleteProductValidator;

type CMD = z.infer<typeof deleteProductCommand>;

export class DeleteProductCommand {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(organizationId: string, cmd: CMD) {
    const [existing, error] = await this.productRepository.findOneById(
      organizationId,
      cmd.id,
    );

    if (error)
      throw new InternalServerError(
        error,
        "api_errors.catalog.products.isr_on_find",
      );

    if (!existing) throw new ProductNotFoundException();

    const [, errDeleting] = await this.productRepository.delete(
      organizationId,
      cmd.id,
    );

    if (errDeleting)
      throw new InternalServerError(
        errDeleting,
        "api_errors.catalog.products.isr_on_delete",
      );
  }
}
