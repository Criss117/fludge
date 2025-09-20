import { DbModule } from '@core/db/db.module';
import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsQueriesRepository } from './repositories/products-queries.repository';
import { CreateProductUsecase } from './use-cases/create-product.usecase';
import { CategoriesController } from './controllers/categories.controller';
import { CreateCategoryUsecase } from './use-cases/create-category.usecase';
import { CategoriesCommandRepository } from './repositories/categories-command.repository';
import { CategoriesQueriesRepository } from './repositories/categories-queries.repository';

@Module({
  imports: [DbModule],
  controllers: [ProductsController, CategoriesController],
  providers: [
    CreateProductUsecase,
    CreateCategoryUsecase,

    CategoriesCommandRepository,
    CategoriesQueriesRepository,
    ProductsQueriesRepository,
  ],
})
export class ProductsModule {}
