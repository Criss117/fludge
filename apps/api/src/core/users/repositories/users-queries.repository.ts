import { and, eq, or, SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { users } from '@repo/db';
import { DBSERVICE, type LibSQLDatabase } from 'src/core/db/db.module';
import type { FindManyUsersByDto } from './dtos/find-many-users-by.dto';

type Options = {
  ensureActive?: boolean;
};

@Injectable()
export class UsersQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findManyBy(meta: FindManyUsersByDto, options?: Options) {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (meta.email) {
      filters.push(eq(users.email, meta.email));
    }

    if (meta.username) {
      filters.push(eq(users.username, meta.username));
    }

    if (meta.id) {
      filters.push(eq(users.id, meta.id));
    }

    if (options?.ensureActive) {
      optionsFilters.push(eq(users.isActive, true));
    }

    return this.db
      .select()
      .from(users)
      .where(and(or(...filters), ...optionsFilters));
  }

  public async findOneBy(meta: FindManyUsersByDto, options?: Options) {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (meta.email) {
      filters.push(eq(users.email, meta.email));
    }

    if (meta.username) {
      filters.push(eq(users.username, meta.username));
    }

    if (meta.id) {
      filters.push(eq(users.id, meta.id));
    }

    if (options?.ensureActive) {
      optionsFilters.push(eq(users.isActive, true));
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(and(...filters, ...optionsFilters));

    if (!user) {
      return null;
    }

    return user;
  }
}
