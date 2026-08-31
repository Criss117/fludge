import { z } from "zod";
import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/category.repository";
import { ORPCError } from "@orpc/server";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories//domain/exceptions/category-not-found.exception copy";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

export const deleteCategoryCommand = z.object({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
});

type CMD = z.infer<typeof deleteCategoryCommand>;

export class DeleteCategoryCommand {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingCategory, errFinding] =
      await this.categoryRepository.findOneById(
        activeOrganization.id.toString(),
        cmd.id,
      );

    if (errFinding)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener la categoría",
        cause: errFinding.cause,
      });

    if (!existingCategory) throw new CategoryNotFoundException();

    const [, errDeleting] = await this.categoryRepository.delete(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errDeleting)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al eliminar la categoría",
        cause: errDeleting.cause,
      });
  }
}
