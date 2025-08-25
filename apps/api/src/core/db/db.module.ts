import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/libsql';
import { LibSQLDatabase as LibSQLBase } from 'drizzle-orm/libsql';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { ResultSet } from '@libsql/client';

import * as schemas from './schemas';

export const DBSERVICE = Symbol('DBSERVICE');
export type LibSQLDatabase = LibSQLBase<typeof schemas>;
export type TX = SQLiteTransaction<
  'async',
  ResultSet,
  typeof schemas,
  ExtractTablesWithRelations<typeof schemas>
>;

@Module({
  providers: [
    {
      provide: DBSERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('TURSO_DATABASE_URL');
        const authToken = configService.get<string>('TURSO_AUTH_TOKEN');

        return drizzle({
          connection: {
            url,
            authToken,
          },
        }) as LibSQLDatabase;
      },
    },
  ],
  exports: [DBSERVICE],
})
export class DbModule {}
