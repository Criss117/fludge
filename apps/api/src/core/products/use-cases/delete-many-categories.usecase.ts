import { Injectable } from '@nestjs/common';
import { DeleteManyCategoriesDto } from '../dtos/delete-many-categories';
import { CategoriesCommandRepository } from '../repositories/categories-command.repository';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';
import { DeleteCategoryDto } from '../repositories/dtos/delete-category.dto';

@Injectable()
export class DeleteManyCategoriesUsecase {
  constructor(
    private readonly categoriesCommandRepository: CategoriesCommandRepository,
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
  ) {}

  public async execute(businessId: string, data: DeleteManyCategoriesDto) {
    const categories = await this.categoriesQueriesRepository.findManyBy(
      {
        ids: data.categoriesIds,
        businessId,
      },
      {
        ensureActive: true,
      },
    );

    if (!categories.length || categories.length !== data.categoriesIds.length) {
      throw new CategoryNotFoundException(
        'No se pudieron encontrar las categorías',
      );
    }

    const parentsCategories = categories.filter(
      (category) => category.parentId === null,
    );

    const subCategories = categories.filter(
      (category) => category.parentId !== null,
    );

    if (parentsCategories.length > 0) {
      const subCats = await this.categoriesQueriesRepository.findManyBy(
        {
          parentIds: parentsCategories.flatMap((category) => category.id),
          businessId,
        },
        {
          ensureActive: true,
        },
      );

      subCategories.push(
        ...subCats.filter((c) => !subCategories.some((sb) => sb.id === c.id)),
      );
    }

    const categoriesToDelete: DeleteCategoryDto[] = [
      ...parentsCategories.map((c) => ({
        businessId: c.businessId,
        categoryId: c.id,
      })),
      ...subCategories.map((c) => ({
        businessId: c.businessId,
        categoryId: c.id,
      })),
    ];

    await this.categoriesCommandRepository.deleteMany(categoriesToDelete);
  }
}
