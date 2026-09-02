import {
  jsonObject,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import type { ProductPresentationRepository } from "./product-presentation.repository";
import { and, desc, eq, getColumns, sql } from "drizzle-orm";

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

  public async findOneById(organizationId: string, productId: string) {
    const [productfind, errFinding] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          presentations: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(productPresentation)}
            ) FILTER (WHERE ${productPresentation.productId} IS NOT NULL)
          `.as("presentations"),
        })
        .from(product)
        .innerJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(
          and(
            eq(product.organizationId, organizationId),
            eq(product.id, productId),
          ),
        )
        .orderBy(desc(product.createdAt))
        .groupBy(product.id),
    );

    if (errFinding) return err(errFinding);

    const p = productfind.at(0);

    if (!p) return ok(null);

    const presentations = (
      JSON.parse(p.presentations) as ProductPresentationSelect[]
    ).map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));

    return ok(Product.reconstitute({ ...p, presentations }));
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
          searchBlob: values.searchBlob,
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
            searchBlob: values.searchBlob,
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
        await this.productPresentationRepository.save(
          productEntity.id.toString(),
          productEntity.presentations,
          {
            tx,
          },
        );

      if (errInsertPresentations) throw errInsertPresentations;
    });

    return tryCatch(transaction);
  }

  public async delete(organizationId: string, productId: string) {
    const transaction = this.db.transaction(async (tx) => {
      const [, errDeletePresentations] =
        await this.productPresentationRepository.delete(
          organizationId,
          productId,
          {
            tx,
          },
        );

      if (errDeletePresentations) throw errDeletePresentations;

      await tx
        .delete(product)
        .where(
          and(
            eq(product.organizationId, organizationId),
            eq(product.id, productId),
          ),
        );
    });

    return tryCatch(transaction);
  }
}
