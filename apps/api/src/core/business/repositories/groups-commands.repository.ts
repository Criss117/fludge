import { DBSERVICE, TX, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable } from '@nestjs/common';
import { groups } from '@repo/db';
import { InsertGroupDto } from './dtos/insert-groups.dto';

type Options = {
  tx?: TX;
};

@Injectable()
export class GroupsCommandsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertGroupDto, options?: Options) {
    const db = options?.tx ?? this.db;

    await db.insert(groups).values(data).onConflictDoUpdate({
      target: groups.id,
      set: data,
    });
  }

  public async saveMany(data: InsertGroupDto[], options?: Options) {
    const db = options?.tx ?? this.db;

    await db.insert(groups).values(data).onConflictDoUpdate({
      target: groups.id,
      set: groups,
    });
  }
}
