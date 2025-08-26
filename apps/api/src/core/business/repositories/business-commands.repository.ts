import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, TX, type LibSQLDatabase } from '@core/db/db.module';
import { business, employees, groups, InsertGroup } from '@repo/db';
import type { InsertBusinessDto } from './dtos/insert-bussines.dto';

type Options = {
  tx: TX;
};

@Injectable()
export class BusinessCommandsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertBusinessDto) {
    if (!data.groups || data.groups.length === 0) {
      const [savedBusiness] = await this.db
        .insert(business)
        .values(data)
        .onConflictDoUpdate({
          target: business.id,
          set: data,
        })
        .returning({
          id: business.id,
        });

      return savedBusiness;
    }

    return this.db.transaction(async (trx) => {
      const [savedBusiness] = await trx
        .insert(business)
        .values(data)
        .onConflictDoUpdate({
          target: business.id,
          set: data,
        })
        .returning({
          id: business.id,
        });

      const groupsToSave: InsertGroup[] =
        data.groups?.map((g) => ({
          businessId: savedBusiness.id,
          name: g.name,
          description: g.description,
          permissions: g.permissions,
        })) ?? [];

      await trx.insert(groups).values(groupsToSave);

      return savedBusiness;
    });
  }

  public async assignEmployee(
    businessId: string,
    userId: string,
    groupId: string,
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    await db.insert(employees).values({
      businessId,
      userId,
      groupId,
    });
  }
}
