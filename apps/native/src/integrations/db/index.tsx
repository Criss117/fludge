import migrations from "../../../drizzle/migrations";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync, type SQLiteRunResult } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { type EmptyRelations, Logger } from "drizzle-orm";
import { LoadingScreen } from "@/core/shared/components/loading-screen";
import { FatalErrorScreen } from "@/core/shared/components/fatal-error-screen";
import type { SQLiteAsyncTransaction } from "drizzle-orm/sqlite-core";

class QueryCounterLogger implements Logger {
  public count = 0;

  logQuery(query: string): void {
    this.count++;
    console.log(`[Consulta #${this.count}]`, query);
  }
}

export const queryLogger = new QueryCounterLogger();

export const DATABASE_NAME = "local.db";

export const expoDb = openDatabaseSync(DATABASE_NAME);

expoDb.execSync("PRAGMA foreign_keys = ON");
expoDb.execSync("PRAGMA journal_mode = WAL");

export const databaseService = drizzle(expoDb, {
  logger: queryLogger,
});

export type DatabaseService = typeof databaseService;
export type TransactionService = SQLiteAsyncTransaction<
  "sync",
  SQLiteRunResult,
  EmptyRelations
>;

function DrizzleStudio() {
  useDrizzleStudio(expoDb);

  return null;
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(databaseService, migrations as any);

  if (error)
    return (
      <FatalErrorScreen
        title="app.errors.db.title"
        message="app.errors.db.message"
        error={error}
      />
    );

  if (!success) return <LoadingScreen message="app.loading.database" />;

  return (
    <>
      {__DEV__ && <DrizzleStudio />}
      {children}
    </>
  );
}
