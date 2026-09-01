import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

export const deleteProductCommand = z.object({
  id: z.uuid({
    error: "El id del producto debe ser un UUID válido",
  }),
});

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
