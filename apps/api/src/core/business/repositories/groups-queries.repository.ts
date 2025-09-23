import { and, desc, eq, or, sql, SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { employees, groups, users } from '@repo/db';
import type { FindManyGroupsByDto } from './dtos/find-many-groups-by.dto';
import type { FindOneGroupDto } from './dtos/find-one-group.dto';
import type { GroupDetail, GroupSummary } from '@repo/core/entities/group';

type Options = {
  ensureActive: boolean;
};

@Injectable()
export class GroupsQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findOne(
    meta: FindOneGroupDto,
    options?: Options,
  ): Promise<GroupDetail | null> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(groups.isActive, true));
    }

    const [group] = await this.db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.id, meta.groupId),
          eq(groups.businessId, meta.businessId),
          ...optionsFilters,
        ),
      );

    if (!group) return null;

    const employessList = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(employees)
      .innerJoin(users, eq(users.id, employees.userId))
      .where(
        and(
          sql`EXISTS (
              SELECT 1 FROM JSON_EACH(${employees.groupIds}) 
              WHERE JSON_EACH.value = ${meta.groupId}
            )`,
          eq(employees.businessId, meta.businessId),
        ),
      );

    return {
      createdAt: group.createdAt,
      description: group.description,
      id: group.id,
      name: group.name,
      permissions: group.permissions,
      isActive: group.isActive,
      updatedAt: group.updatedAt,
      users: employessList,
    };
  }

  public async findManyBy(
    meta: FindManyGroupsByDto,
    options?: Options,
  ): Promise<GroupSummary[]> {
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

    if (meta.name) {
      filters.push(eq(groups.name, meta.name));
    }

    return this.db
      .select()
      .from(groups)
      .where(and(or(...filters), ...optionsFilters))
      .orderBy(desc(groups.createdAt));
  }
}
