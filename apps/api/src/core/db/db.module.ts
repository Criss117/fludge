import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LibSQLDatabase as LibSQLBase } from 'drizzle-orm/libsql';
import { drizzle } from 'drizzle-orm/libsql';
import * as schemas from './schemas';

export const DBSERVICE = Symbol('DBSERVICE');
export type LibSQLDatabase = LibSQLBase<typeof schemas>;

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
