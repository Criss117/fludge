import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { business, groups, InsertGroup } from '@repo/db';
import type { InsertBusinessDto } from './dtos/insert-bussines.dto';

@Injectable()
export class BusinessCommandsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertBusinessDto) {
    if (!data.groups || data.groups.length === 0) {
      await this.db.insert(business).values(data).onConflictDoUpdate({
        target: business.id,
        set: data,
      });

      return;
    }

    await this.db.transaction(async (trx) => {
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
    });
  }
}
