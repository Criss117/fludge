import { DbModule } from '@core/db/db.module';
import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsQueriesRepository } from './repositories/products-queries.repository';
import { CreateProductUsecase } from './use-cases/create-product.usecase';
import { CategoriesController } from './controllers/categories.controller';
import { CreateCategoryUsecase } from './use-cases/create-category.usecase';
import { CategoriesCommandRepository } from './repositories/categories-command.repository';
import { CategoriesQueriesRepository } from './repositories/categories-queries.repository';
import { BusinessModule } from '@core/business/business.module';
import { FindManyCategoriesUsecase } from './use-cases/find-many-categories.usecase';
import { FindOneCategoryUsecase } from './use-cases/find-one-category.usecase';
import { DeleteManyCategoriesUsecase } from './use-cases/delete-many-categories.usecase';
import { UpdateCategoryUseCase } from './use-cases/update-category.usecase';
import { FindManyProductsUseCase } from './use-cases/find-many-products.usecase';

@Module({
  imports: [DbModule, BusinessModule],
  controllers: [ProductsController, CategoriesController],
  providers: [
    CreateProductUsecase,
    CreateCategoryUsecase,
    FindManyCategoriesUsecase,
    FindOneCategoryUsecase,
    DeleteManyCategoriesUsecase,
    UpdateCategoryUseCase,

    FindManyProductsUseCase,

    CategoriesCommandRepository,
    CategoriesQueriesRepository,
    ProductsQueriesRepository,
  ],
})
export class ProductsModule {}
