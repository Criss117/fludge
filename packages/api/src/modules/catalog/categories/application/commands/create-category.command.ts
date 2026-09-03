import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/category.repository";
import type { CategoryUniquenessValidator } from "@fludge/api/modules/catalog/categories/application/services/category-uniqueness-validator.service";
import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { UUID } from "@fludge/utils/uuid";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import { createCategoryValidator } from "@fludge/utils/validators/category.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const createCategoryCommand = createCategoryValidator;

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
      description: cmd.description ?? null,
      organizationId: activeOrganization.id,
      createdBy: loggedMember.id,
    });

    const [uniqueness, errUniqueness] =
      await this.categoryUniquenessValidator.validateUniqueFields(
        activeOrganization.id.toString(),
        {
          name: category.values.name,
          slug: category.values.slug,
        },
      );

    if (errUniqueness)
      throw new InternalServerError(
        errUniqueness,
        "catalog.categories.errors.isr_on_find",
      );

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new CategoryAlreadyExistsException(
        "catalog.categories.errors.name_taken",
      );

    const [, errSaving] = await this.categoryRepository.save(category);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "catalog.categories.errors.isr_on_save",
      );

    return category.values;
  }
}
