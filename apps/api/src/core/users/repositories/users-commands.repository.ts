import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, TX, type LibSQLDatabase } from 'src/core/db/db.module';
import { type InsertUser, users } from '@repo/db';

type Options = {
  tx: TX;
};

@Injectable()
export class UsersCommandsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertUser, options?: Options) {
    const db = options?.tx ?? this.db;

    const [userCreated] = await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: data,
      })
      .returning({
        id: users.id,
      });

    return userCreated;
  }
}
