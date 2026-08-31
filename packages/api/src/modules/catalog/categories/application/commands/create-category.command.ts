import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/category.repository";
import type { CategoryUniquenessValidator } from "@fludge/api/modules/catalog/categories/application/services/category-uniqueness-validator.service";
import { z } from "zod";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

export const createCategoryCommand = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }),
  description: z
    .string({
      error: "La descripción es requerida",
    })
    .optional(),
});

type CMD = z.infer<typeof createCategoryCommand>;

export class CreateCategoryCommand {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryUniquenessValidator: CategoryUniquenessValidator,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const category = Category.create({
      name: cmd.name,
      description: cmd.description,
      organizationId: activeOrganization.id,
      createdBy: loggedMember.id,
    });

    const [uniqueness, errUniqueness] =
      await this.categoryUniquenessValidator.validateUniqueFields({
        name: category.values.name,
        slug: category.values.slug,
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

    const [, errSaving] = await this.categoryRepository.save(category);

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la categoría",
        cause: errSaving.cause,
      });

    return category.values;
  }
}
