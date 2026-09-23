import type { z } from "zod";
import type { CategoryUniquenessValidator } from "../../../../catalog/categories/application/services/category-uniqueness-validator.service";
import { CategoryAlreadyExistsException } from "../../../../catalog/categories/domain/exceptions/category-already-exists.exception";
import { CategoryNotFoundException } from "../../../../catalog/categories/domain/exceptions/category-not-found.exception";
import type { CategoryRepository } from "../../../../catalog/categories/domain/repositories/category.repository";
import type { UserAuthContext } from "../../../../iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { Status } from "../../../../shared/value-objects/status";
import { Slug } from "@fludge/utils/slugify";
import { updateCategoryValidator } from "@fludge/utils/validators/category.validators";

export const updateCategoryCommand = updateCategoryValidator;

type CMD = z.infer<typeof updateCategoryCommand>;

export class UpdateCategoryCommand {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryUniquenessValidator: CategoryUniquenessValidator,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [existingCategory, errFinding] =
      await this.categoryRepository.findById(organizationId, cmd.id);

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.categories.isr_on_find",
      );

    if (!existingCategory) throw new CategoryNotFoundException();

    if (cmd.name && cmd.name !== existingCategory.values.name) {
      const [uniqueness, errUniqueness] =
        await this.categoryUniquenessValidator.validateUniqueFields(
          organizationId,
          {
            name: cmd.name,
            slug: new Slug(cmd.name).toString(),
          },
          existingCategory.id.toString(),
        );

      if (errUniqueness)
        throw new InternalServerError(
          errUniqueness,
          "api_errors.catalog.categories.isr_on_find",
        );

      if (uniqueness.nameTaken || uniqueness.slugTaken)
        throw new CategoryAlreadyExistsException(
          "api_errors.catalog.categories.name_taken",
        );
    }

    existingCategory.update({
      name: cmd.name,
      description: cmd.description,
      status: cmd.status ? new Status(cmd.status) : undefined,
    });

    const [, errSaving] = await this.categoryRepository.update(existingCategory);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.categories.isr_on_save",
      );

    return existingCategory.values;
  }
}