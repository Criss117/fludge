import { and, eq, or, SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { employees, groups, users } from '@repo/db';
import type { FindManyGroupsByDto } from './dtos/find-many-groups-by.dto';
import type { FindOneGroupDto } from './dtos/find-one-group.dto';
import { getTableColumns } from 'drizzle-orm';
import { GroupDetail } from '@repo/core/entities/group';

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

    const groupRes = await this.db
      .select({
        ...getTableColumns(groups),
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          email: users.email,
          createdAt: users.createdAt,
        },
      })
      .from(groups)
      .leftJoin(users, eq(users.id, employees.userId))
      .where(
        and(
          eq(groups.id, meta.id),
          eq(groups.businessId, meta.businessId),
          ...optionsFilters,
        ),
      );

    if (!groupRes.length) return null;

    const usersList: GroupDetail['users'] = [];

    for (const group of groupRes) {
      if (!group.user) continue;

      usersList.push(group.user);
    }

    const group = groupRes[0];

    return {
      createdAt: group.createdAt,
      description: group.description,
      id: group.id,
      name: group.name,
      permissions: group.permissions,
      isActive: group.isActive,
      updatedAt: group.updatedAt,
      users: usersList,
    };
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
