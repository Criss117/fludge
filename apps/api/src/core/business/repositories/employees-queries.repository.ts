import { Inject, Injectable } from '@nestjs/common';
import { employees } from '@repo/db';

import { DBSERVICE, type TX, type LibSQLDatabase } from '@core/db/db.module';
import { InsertEmployeeDto } from './dtos/insert-employee.dto';

type Options = {
  tx: TX;
};

@Injectable()
export class EmployeesQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertEmployeeDto, options?: Options) {
    const db = options?.tx ?? this.db;

    return db
      .insert(employees)
      .values(data)
      .onConflictDoUpdate({
        target: [employees.businessId, employees.userId],
        set: {
          groupIds: data.groupIds,
        },
      });
  }
}
