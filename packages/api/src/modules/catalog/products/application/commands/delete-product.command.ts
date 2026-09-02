import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { z } from "zod";
import { deleteProductValidator } from "@fludge/utils/validators/product.validators";
import { ORPCError } from "@orpc/server";

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
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al buscar el producto",
        cause: error.cause,
      });

    if (!existing)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró el producto",
      });

    const [, errDeleting] = await this.productRepository.delete(
      organizationId,
      cmd.id,
    );

    if (errDeleting)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al eliminar el producto",
        cause: errDeleting.cause,
      });
  }
}
