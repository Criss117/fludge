import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";
import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";
import type { ProductService } from "@fludge/api/modules/catalog/products/application/services/product.service";
import type { PGProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product-presentation.repository";
import type { PGProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product.repository";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

export const updateProductCommand = createProductCommand.extend({
  id: z.uuid({
    error: "El id del producto es requerido",
  }),
});

type CMD = z.infer<typeof updateProductCommand> & {
  organizationId: string;
  updatedBy: {
    memberId: string;
  };
};

export class UpdateProductCommand {
  constructor(
    private readonly productRepository: PGProductRepository,
    private readonly productPresentationRepository: PGProductPresentationRepository,
    private readonly categoryRepository: PGCategoryRepository,
    private readonly productService: ProductService,
  ) {}

  public async execute(cmd: CMD) {
    const [existing, errorExists] = await this.productRepository.findOne(
      cmd.id,
      cmd.organizationId,
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);
  }
}
