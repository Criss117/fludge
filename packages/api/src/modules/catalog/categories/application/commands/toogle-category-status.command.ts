import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/domain/repositories/category.repository";
import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { updateCategoryValidator } from "@fludge/utils/validators/category.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";

export const toggleCategoryStatusCommand = updateCategoryValidator.pick({
  id: true,
});

type CMD = z.infer<typeof toggleCategoryStatusCommand>;

export class ToggleCategoryStatusCommand {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingCategory, errFinding] =
      await this.categoryRepository.findOneById(
        activeOrganization.id.toString(),
        cmd.id.toString(),
      );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.categories.isr_on_find",
      );

    if (!existingCategory) throw new CategoryNotFoundException();

    existingCategory.toggleStatus();

    const [, errSaving] = await this.categoryRepository.save(existingCategory);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.categories.isr_on_save",
      );

    return existingCategory.values;
  }
}
