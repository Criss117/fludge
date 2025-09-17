import { Inject, Injectable } from '@nestjs/common';
import { and, eq, type SQL } from 'drizzle-orm';
import { employees } from '@repo/db';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { FindOneEmployeeDto } from './dtos/find-one-employee.dto';

type Options = {
  ensureActive?: boolean;
};

@Injectable()
export class EmployeesQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findOne(meta: FindOneEmployeeDto, options?: Options) {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(employees.isActive, true));
    }

    const [employee] = await this.db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.businessId, meta.businessId),
          eq(employees.userId, meta.userId),
          ...optionsFilters,
        ),
      );

    if (!employee) {
      return null;
    }

    return employee;
  }
}
