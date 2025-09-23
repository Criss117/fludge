import { Injectable } from '@nestjs/common';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';

@Injectable()
export class FindManyCategoriesUsecase {
  constructor(
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
  ) {}

  public async execute(businessId: string) {
    return this.categoriesQueriesRepository.findManyBy(
      {
        businessId,
      },
      {
        ensureActive: true,
      },
    );
  }
}
