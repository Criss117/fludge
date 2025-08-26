import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or, SQL } from 'drizzle-orm';
import { business, employees, groups, users } from '@repo/db';
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

  public async findOne(id: string, options?: Options) {
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
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(and(eq(employees.businessId, id), ...optionsFilters));

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

  public async findUserIsIn(userId: string, options?: Options) {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(business.isActive, true));
    }

    const rootInPromise = this.db
      .select({
        id: business.id,
        name: business.name,
        nit: business.nit,
      })
      .from(business)
      .where(and(eq(business.rootUserId, userId), ...optionsFilters));

    const employeeInPromise = this.db
      .select({
        id: business.id,
        name: business.name,
        nit: business.nit,
        permissions: groups.permissions,
      })
      .from(employees)
      .innerJoin(business, eq(business.id, employees.businessId))
      .innerJoin(groups, eq(groups.id, employees.groupId))
      .where(and(eq(employees.userId, userId), ...optionsFilters));

    const [isRootIn, isEmployeeIn] = await Promise.all([
      rootInPromise,
      employeeInPromise,
    ]);

    return {
      isRootIn,
      isEmployeeIn,
    };
  }
}
