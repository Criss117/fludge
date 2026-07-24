import type { PGProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product-presentation.repository";
import type { PGProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product.repository";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

export const deleteProductCommand = z.object({
  productIds: z
    .array(
      z.uuid({
        error: "El id del producto es requerido",
      }),
    )
    .min(1, { error: "El id del producto es requerido" }),
});

type CMD = z.infer<typeof deleteProductCommand> & { organizationId: string };

export class DeleteProductCommand {
  constructor(
    private readonly productRepository: PGProductRepository,
    private readonly productPresentationRepository: PGProductPresentationRepository,
  ) {}

  public async execute(cmd: CMD) {
    return this.productRepository.transaction(async (tx) => {
      const [, errorDeletingProducts] = await this.productRepository.hardDelete(
        cmd.organizationId,
        cmd.productIds,
        { tx },
      );

      if (errorDeletingProducts)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorDeletingProducts ?? {
            message: "Error eliminando producto",
          },
        );

      const [, errorDeletingPresentations] =
        await this.productPresentationRepository.hardDelete(
          cmd.organizationId,
          cmd.productIds.map((p) => p.toString()),
          { tx },
        );

      if (errorDeletingPresentations)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorDeletingPresentations ?? {
            message: "Error eliminando presentación",
          },
        );

      return null;
    });
  }
}
