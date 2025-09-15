import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, TX, type LibSQLDatabase } from '@core/db/db.module';
import { business, employees } from '@repo/db';
import { GroupsCommandsRepository } from './groups-commands.repository';
import { InsertGroupDto } from './dtos/insert-groups.dto';
import type { InsertBusinessDto } from './dtos/insert-bussines.dto';

type Options = {
  tx: TX;
};

@Injectable()
export class BusinessCommandsRepository {
  constructor(
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
    private readonly groupsCommandsRepository: GroupsCommandsRepository,
  ) {}

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

      const groupsToSave: InsertGroupDto[] =
        data.groups?.map((g) => ({
          businessId: savedBusiness.id,
          name: g.name,
          description: g.description,
          permissions: g.permissions,
        })) ?? [];

      await this.groupsCommandsRepository.saveMany(groupsToSave, {
        tx: trx,
      });

      return savedBusiness;
    });
  }

  public async assignEmployees(
    businessId: string,
    userId: string,
    groupIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    await db.insert(employees).values({
      businessId,
      userId,
      groupIds,
    });
  }
}
