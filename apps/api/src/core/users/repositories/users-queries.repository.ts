import { and, eq, inArray, or, SQL } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { employees, groups, users } from '@repo/db';
import { DBSERVICE, type LibSQLDatabase } from 'src/core/db/db.module';
import type { FindManyUsersByDto } from './dtos/find-many-users-by.dto';
import type { FindOneEmployeeDto } from './dtos/find-one-employee.dto';
import { EmployeeDetail } from '@repo/core/entities/user';

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

  public async findOneEmployee(
    meta: FindOneEmployeeDto,
    options?: Options,
  ): Promise<EmployeeDetail | null> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(users.isActive, true));
    }

    const [user] = await this.db
      .select({
        ...getTableColumns(users),
        groupIds: employees.groupIds,
      })
      .from(users)
      .leftJoin(
        employees,
        and(
          eq(employees.userId, meta.userId),
          eq(employees.businessId, meta.businessId),
        ),
      )
      .where(and(eq(users.id, meta.userId), ...optionsFilters));

    if (!user) {
      return null;
    }

    if (!user.groupIds) {
      return {
        ...user,
        employeeIn: meta.businessId,
        groups: [],
      };
    }

    const groupsSummary = await this.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        permissions: groups.permissions,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .where(and(inArray(groups.id, user.groupIds), ...optionsFilters));

    return {
      ...user,
      employeeIn: meta.businessId,
      groups: groupsSummary,
    };
  }
}
