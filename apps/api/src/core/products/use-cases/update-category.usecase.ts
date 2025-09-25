import { Injectable } from '@nestjs/common';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';
import { CategoriesCommandRepository } from '../repositories/categories-command.repository';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
    private readonly categoriesCommandRepository: CategoriesCommandRepository,
  ) {}

  public async execute(
    businessId: string,
    categoryId: string,
    data: UpdateCategoryDto,
  ) {
    const [existingCategory] =
      await this.categoriesQueriesRepository.findManyBy(
        {
          businessId,
          ids: [categoryId],
        },
        {
          ensureActive: true,
        },
      );

    if (!existingCategory) {
      throw new CategoryNotFoundException();
    }

    if (
      existingCategory.name === data.name &&
      existingCategory.description === data.description
    ) {
      return;
    }

    await this.categoriesCommandRepository.save({
      businessId,
      id: categoryId,
      name: data.name,
      description: data.description,
    });
  }
}
