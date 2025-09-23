import { Injectable } from '@nestjs/common';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';

@Injectable()
export class FindOneCategoryUsecase {
  constructor(
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
  ) {}

  public async execute(businessId: string, categoryId: string) {
    const category = await this.categoriesQueriesRepository.findOne(
      {
        businessId,
        categoryId,
      },
      {
        ensureActive: true,
      },
    );

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return category;
  }
}
