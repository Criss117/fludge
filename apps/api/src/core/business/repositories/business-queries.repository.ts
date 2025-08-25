import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or, SQL } from 'drizzle-orm';
import { business } from '@repo/db';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { FindManyBusinessByDto } from './dtos/find-many-business-by.dto';

type Options = {
  ensureActive?: boolean;
};

@Injectable()
export class BusinessQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findManyBy(meta: FindManyBusinessByDto, options?: Options) {
    const { id, name, nit } = meta;

    if (!id && !name && !nit) {
      throw new Error('Invalid query');
    }

    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (id) {
      filters.push(eq(business.id, id));
    }

    if (name) {
      filters.push(eq(business.name, name));
    }

    if (nit) {
      filters.push(eq(business.nit, nit));
    }

    if (options?.ensureActive) {
      optionsFilters.push(eq(business.isActive, true));
    }

    return this.db
      .select()
      .from(business)
      .where(and(or(...filters), ...optionsFilters));
  }
}
