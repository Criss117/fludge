import migrations from "../../../drizzle/migrations";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { FatalErrorScreen } from "@/modules/shared/components/fatal-error";
import { Logger } from "drizzle-orm";

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

  if (!success) return <LoadingScreen message="app.loading_database" />;

  return (
    <>
      {__DEV__ && <DrizzleStudio />}
      {children}
    </>
  );
}
