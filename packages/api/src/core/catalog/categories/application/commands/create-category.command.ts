import type { z } from "zod";
import type { CategoryUniquenessValidator } from "../../../../catalog/categories/application/services/category-uniqueness-validator.service";
import { Category } from "../../../../catalog/categories/domain/entities/category.entity";
import { CategoryAlreadyExistsException } from "../../../../catalog/categories/domain/exceptions/category-already-exists.exception";
import type { CategoryRepository } from "../../../../catalog/categories/domain/repositories/category.repository";
import type { UserAuthContext } from "../../../../iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { createCategoryValidator } from "@fludge/utils/validators/category.validators";

export const createCategoryCommand = createCategoryValidator;

type CMD = z.infer<typeof createCategoryCommand>;

export class CreateCategoryCommand {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryUniquenessValidator: CategoryUniquenessValidator,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const category = Category.create({
      name: cmd.name,
      description: cmd.description ?? "",
      organizationId: authContext.organizationId,
      createdBy: authContext.member.id,
    });

    const [uniqueness, errUniqueness] =
      await this.categoryUniquenessValidator.validateUniqueFields(
        authContext.organizationId.toString(),
        {
          name: category.values.name,
          slug: category.values.slug,
        },
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

    const [, errSaving] = await this.categoryRepository.insert(category);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.categories.isr_on_save",
      );

    return category.values;
  }
}