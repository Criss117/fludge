import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, or, SQL } from 'drizzle-orm';
import { business, employees, groups, users } from '@repo/db';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { FindManyBusinessByDto } from './dtos/find-many-business-by.dto';
import type { BusinessDetail } from '@repo/core/entities/business';
import type { LogedUser } from '@repo/core/entities/user';

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
      .where(and(or(...filters), ...optionsFilters))
      .orderBy(desc(business.createdAt));
  }

  public async findOne(id: string, options?: Options): Promise<BusinessDetail> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(business.isActive, true));
    }

    const findBusinessPromise = this.db
      .select()
      .from(business)
      .where(and(eq(business.id, id), ...optionsFilters));

    const findGroupsPromise = this.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        permissions: groups.permissions,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .where(and(eq(groups.businessId, id), ...optionsFilters));

    const findEmployeesPromise = this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(and(eq(employees.businessId, id), ...optionsFilters))
      .groupBy(users.id);

    const [[businessRes], groupsRes, employeesRes] = await Promise.all([
      findBusinessPromise,
      findGroupsPromise,
      findEmployeesPromise,
    ]);

    return {
      ...businessRes,
      groups: groupsRes,
      employees: employeesRes,
    };
  }

  public async findUserIsIn(
    userId: string,
    options?: Options,
  ): Promise<{
    isEmployeeIn: LogedUser['isEmployeeIn'];
    isRootIn: LogedUser['isRootIn'];
  }> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(business.isActive, true));
    }

    const isRootIn = await this.db
      .select({
        id: business.id,
        name: business.name,
        nit: business.nit,
      })
      .from(business)
      .where(and(eq(business.rootUserId, userId), ...optionsFilters));

    if (isRootIn.length) {
      return {
        isEmployeeIn: [],
        isRootIn,
      };
    }

    const employeeInfo = await this.db
      .select({
        id: employees.businessId,
        name: business.name,
        nit: business.nit,
        groupIds: employees.groupIds,
      })
      .from(employees)
      .innerJoin(business, eq(employees.businessId, business.id))
      .where(and(eq(employees.userId, userId), ...optionsFilters));

    if (!employeeInfo.length) {
      return {
        isEmployeeIn: [],
        isRootIn: [],
      };
    }

    const employeeGroupsPromises = employeeInfo.map(({ groupIds }) =>
      this.db
        .select({
          id: groups.id,
          name: groups.name,
          permissions: groups.permissions,
        })
        .from(groups)
        .where(inArray(groups.id, groupIds)),
    );

    const [employeeGroups] = await Promise.all(employeeGroupsPromises);

    const isEmployeeIn = employeeInfo.map((info) => {
      const permissions = employeeGroups
        .filter((e) => info.groupIds.includes(e.id))
        .flatMap((e) => e.permissions);

      return {
        id: info.id,
        name: info.name,
        nit: info.nit,
        permissions: Array.from(new Set(permissions)),
      };
    });

    return {
      isEmployeeIn,
      isRootIn: [],
    };
  }
}
