import type { DatabaseService, TransactionService } from "@fludge/db";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { product } from "@fludge/db/schema/catalog.schema";
import type { ProductPresentationRepository } from "./product-presentation.repository";

type Options = {
  tx?: TransactionService;
};

export class ProductRepository extends TransactionalRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly productPresentationRepository: ProductPresentationRepository,
  ) {
    super(db);
  }

  public async saveOnlyProduct(productEntity: Product, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = productEntity.values;

    return tryCatch(
      db
        .insert(product)
        .values({
          id: values.id,
          organizationId: values.organizationId,
          categoryId: values.categoryId,
          name: values.name,
          searchName: values.searchName,
          slug: values.slug,
          description: values.description,
          stock: values.stock,
          minStock: values.minStock,
          allowNegativeStock: values.allowNegativeStock,
          status: values.status,
          createdBy: values.createdBy,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .onConflictDoUpdate({
          target: product.id,
          set: {
            name: values.name,
            searchName: values.searchName,
            slug: values.slug,
            description: values.description,
            stock: values.stock,
            minStock: values.minStock,
            allowNegativeStock: values.allowNegativeStock,
            status: values.status,
            updatedAt: values.updatedAt,
            categoryId: values.categoryId,
          },
        }),
    );
  }

  public async save(productEntity: Product) {
    const transaction = this.db.transaction(async (tx) => {
      const [, errInsertProduct] = await this.saveOnlyProduct(productEntity, {
        tx,
      });

      if (errInsertProduct) throw errInsertProduct;

      const [, errInsertPresentations] =
        await this.productPresentationRepository.save(productEntity, {
          tx,
        });

      if (errInsertPresentations) throw errInsertPresentations;
    });

    return tryCatch(transaction);
  }
}
