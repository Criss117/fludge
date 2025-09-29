import { and, eq, type SQL, or, desc, count } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { categories, products } from '@repo/db';
import type { FindManyProductsByDto } from './dtos/find-many-products-by.dto';
import type { FindOneProductByDto } from './dtos/find-one-product-by.dto';
import type {
  ProductDetail,
  ProductSummary,
} from '@repo/core/entities/product';

type Options = {
  ensureActive?: boolean;
  limit?: number;
  offset?: number;
};

@Injectable()
export class ProductsQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findMany(
    businessId: string,
    options?: Options,
  ): Promise<ProductSummary[]> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    return this.db
      .select()
      .from(products)
      .where(and(eq(products.businessId, businessId), ...optionsFilters))
      .limit(options?.limit ?? 10)
      .offset(options?.offset ?? 0)
      .orderBy(desc(products.createdAt));
  }

  public async findManyBy(
    meta: FindManyProductsByDto,
    options?: Options,
  ): Promise<ProductSummary[]> {
    const orFilters: SQL[] = [];
    const andFilters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    if (meta.name) {
      orFilters.push(eq(products.name, meta.name));
    }

    if (meta.categoryId) {
      orFilters.push(eq(products.categoryId, meta.categoryId));
    }

    if (meta.brandId) {
      orFilters.push(eq(products.brandId, meta.brandId));
    }

    if (meta.barcode) {
      orFilters.push(eq(products.barcode, meta.barcode));
    }

    if (meta.id) {
      orFilters.push(eq(products.id, meta.id));
    }

    if (meta.businessId) {
      andFilters.push(eq(products.businessId, meta.businessId));
    }

    return this.db
      .select()
      .from(products)
      .where(and(or(...orFilters), ...andFilters, ...optionsFilters));
  }

  public async findOneBy(
    meta: FindOneProductByDto,
    options?: Options,
  ): Promise<ProductDetail | null> {
    const optionsFilters: SQL[] = [];
    const filters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    if (meta.productId) {
      filters.push(eq(products.id, meta.productId));
    }

    if (meta.businessId) {
      filters.push(eq(products.businessId, meta.businessId));
    }

    if (meta.barcode) {
      filters.push(eq(products.barcode, meta.barcode));
    }

    const [product] = await this.db
      .select()
      .from(products)
      .where(and(...filters, ...optionsFilters));

    if (!product) {
      return null;
    }

    const productToShow: ProductDetail = {
      ...product,
      category: null,
      brand: null,
      providers: [],
    };

    if (product.categoryId) {
      const categoryOptionsFilters: SQL[] = [];

      if (options?.ensureActive) {
        categoryOptionsFilters.push(eq(categories.isActive, true));
      }

      const [category] = await this.db
        .select()
        .from(categories)
        .where(
          and(eq(categories.id, product.categoryId), ...categoryOptionsFilters),
        );

      if (category) {
        productToShow.category = category;
      }
    }

    return productToShow;
  }

  public async countProducts(businessId: string, options?: Options) {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    const [{ total }] = await this.db
      .select({
        total: count(products.id),
      })
      .from(products)
      .where(and(eq(products.businessId, businessId), ...optionsFilters));

    return total;
  }
}
