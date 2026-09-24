import type { z } from "zod";
import type { CategoryRepository } from "@fludge/api/core/catalog/categories/domain/repositories/category.repository";
import { CategoryNotFoundException } from "@fludge/api/core/catalog/categories/domain/exceptions/category-not-found.exception";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { updateCategoryValidator } from "@fludge/utils/validators/category.validators";

export const toggleCategoryStatusCommand = updateCategoryValidator.pick({
  id: true,
});

type CMD = z.infer<typeof toggleCategoryStatusCommand>;

export class ToggleCategoryStatusCommand {
  constructor(private readonly categoryRepository: CategoryRepository) {}

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

    existingCategory.toggleStatus();

    const [, errSaving] =
      await this.categoryRepository.update(existingCategory);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.categories.isr_on_save",
      );

    return existingCategory.values;
  }
}
