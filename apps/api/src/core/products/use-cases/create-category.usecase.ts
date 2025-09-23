import { Injectable } from '@nestjs/common';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';
import { CategoryAlreadyExistsException } from '../exceptions/category-already-exists.exception';
import { CategoriesCommandRepository } from '../repositories/categories-command.repository';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';

@Injectable()
export class CreateCategoryUsecase {
  constructor(
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
    private readonly categoriesCommandRepository: CategoriesCommandRepository,
  ) {}

  public async execute(businessId: string, data: CreateCategoryDto) {
    const categories = await this.categoriesQueriesRepository.findManyBy(
      {
        businessId,
        name: data.name,
        parentIds: data.parentId ? [data.parentId] : [],
      },
      {
        ensureActive: true,
      },
    );

    if (categories.length > 0) {
      throw new CategoryAlreadyExistsException();
    }

    if (!data.parentId) {
      await this.categoriesCommandRepository.save({
        name: data.name,
        businessId,
        description: data.description,
      });

      return;
    }

    const [parentCategory] = await this.categoriesQueriesRepository.findManyBy(
      {
        businessId,
        ids: [data.parentId],
      },
      {
        ensureActive: true,
      },
    );

    if (!parentCategory) {
      throw new CategoryNotFoundException('La categoría padre no existe');
    }

    if (parentCategory.parentId) {
      throw new CategoryAlreadyExistsException(
        'La categoría ya tiene un padre',
      );
    }

    await this.categoriesCommandRepository.save({
      name: data.name,
      businessId,
      description: data.description,
      parentId: data.parentId,
    });
  }
}
