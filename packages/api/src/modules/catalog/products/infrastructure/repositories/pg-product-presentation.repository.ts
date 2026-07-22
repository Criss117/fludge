import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import {
  productPresentation,
  type ProductPresentationInsert,
} from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

export class PGProductPresentationRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async save(
    values: ProductPresentationInsert[],
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    return tryCatch(
      db.insert(productPresentation).values(values).returning().execute(),
    );
  }
}
