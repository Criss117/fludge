import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { PGProductsCommandsRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-products-commands.repository";

export const deleteProductCommand = z.object({
  productIds: z
    .array(
      z.uuid({
        error: "Id de producto no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de producto.",
    }),
});

type CMD = z.infer<typeof deleteProductCommand> & {
  organizationId: string;
};

export class DeleteProductCommand {
  constructor(
    private readonly productsCommandsRepository: PGProductsCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [count, error] =
      await this.productsCommandsRepository.hardDelete(
        cmd.organizationId,
        cmd.productIds,
      );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return count;
  }
}