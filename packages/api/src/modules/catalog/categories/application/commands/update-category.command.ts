import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/category.repository";
import type { CategoryUniquenessValidator } from "@fludge/api/modules/catalog/categories/application/services/category-uniqueness-validator.service";
import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import { updateCategoryValidator } from "@fludge/utils/validators/category.validators";
import { Slug } from "@fludge/utils/slugify";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";

export const updateCategoryCommand = updateCategoryValidator;

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
      throw new InternalServerError(
        errFinding,
        "catalog.categories.errors.isr_on_find",
      );

    if (!existingCategory) throw new CategoryNotFoundException();

    if (cmd.name && cmd.name !== existingCategory.values.name) {
      const [uniqueness, errUniqueness] =
        await this.categoryUniquenessValidator.validateUniqueFields(
          activeOrganization.id.toString(),
          {
            name: cmd.name,
            slug: new Slug(cmd.name).toString(),
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
    }

    existingCategory.update({
      name: cmd.name,
      description: cmd.description,
      status: cmd.status ? new Status(cmd.status) : undefined,
    });

    const [, errSaving] = await this.categoryRepository.save(existingCategory);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "catalog.categories.errors.isr_on_save",
      );

    return existingCategory.values;
  }
}
