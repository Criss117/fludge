import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/category.repository";
import type { CategoryUniquenessValidator } from "@fludge/api/modules/catalog/categories/application/services/category-uniqueness-validator.service";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import { createCategoryCommand } from "./create-category.command";
import { statusEnum } from "@fludge/db/schema/enums";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories//domain/exceptions/category-not-found.exception copy";
import { Slug } from "@fludge/utils/slugify";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

export const updateCategoryCommand = createCategoryCommand.partial().extend({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
  status: z.enum(statusEnum).optional(),
});

type CMD = z.infer<typeof updateCategoryCommand>;

export class UpdateCategoryCommand {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryUniquenessValidator: CategoryUniquenessValidator,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingCategory, errFinding] =
      await this.categoryRepository.findOneById(
        activeOrganization.id.toString(),
        cmd.id.toString(),
      );

    if (errFinding)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener la categoría",
        cause: errFinding.cause,
      });

    if (!existingCategory) throw new CategoryNotFoundException();

    if (cmd.name && cmd.name !== existingCategory.values.name) {
      const [uniqueness, errUniqueness] =
        await this.categoryUniquenessValidator.validateUniqueFields({
          name: cmd.name,
          slug: new Slug(cmd.name).toString(),
        });

      if (errUniqueness)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Error al validar la unicidad de la categoría",
          cause: errUniqueness.cause,
        });

      if (uniqueness.nameTaken)
        throw new CategoryAlreadyExistsException("El nombre ya está en uso");

      if (uniqueness.slugTaken)
        throw new CategoryAlreadyExistsException("El slug ya está en uso");
    }

    existingCategory.update({
      name: cmd.name,
      description: cmd.description,
      status: cmd.status ? new Status(cmd.status) : undefined,
    });

    const [, errSaving] = await this.categoryRepository.save(existingCategory);

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la categoría",
        cause: errSaving.cause,
      });

    return existingCategory.values;
  }
}
