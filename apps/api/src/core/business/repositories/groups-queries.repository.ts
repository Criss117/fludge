import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable } from '@nestjs/common';
import { groups } from '@repo/db';
import { and, eq, or, SQL } from 'drizzle-orm';
import { FindManyGroupsByDto } from './dtos/find-many-groups-by.dto';

type Options = {
  ensureActive: boolean;
};

@Injectable()
export class GroupsQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findOne(id: string, options?: Options) {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(groups.isActive, true));
    }

    const [group] = await this.db
      .select()
      .from(groups)
      .where(and(eq(groups.id, id), ...optionsFilters));

    if (!group) return null;

    return group;
  }

  public async findManyBy(meta: FindManyGroupsByDto, options?: Options) {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(groups.isActive, true));
    }

    if (meta.businessId) {
      filters.push(eq(groups.businessId, meta.businessId));
    }

    if (meta.id) {
      filters.push(eq(groups.id, meta.id));
    }

    return this.db
      .select()
      .from(groups)
      .where(and(or(...filters), ...optionsFilters));
  }
}
