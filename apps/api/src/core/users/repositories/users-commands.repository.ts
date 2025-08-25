import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from 'src/core/db/db.module';
import { type InsertUser, users } from '@repo/db';

@Injectable()
export class UsersCommandsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertUser) {
    return this.db.insert(users).values(data).onConflictDoUpdate({
      target: users.id,
      set: data,
    });
  }
}
