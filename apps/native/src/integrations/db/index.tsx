import migrations from "../../../drizzle/migrations";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Text } from "@/modules/shared/components/app-text";
import { FatalErrorScreen } from "@/modules/shared/components/fatal-error";

export const DATABASE_NAME = "local.db";

export const expoDb = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

export const databaseService = drizzle(expoDb);

export type DatabaseService = typeof databaseService;

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(databaseService, migrations as any);
  useDrizzleStudio(expoDb);

  if (error)
    return (
      <FatalErrorScreen
        title="app.errors.db.title"
        message="app.errors.db.message"
        error={error}
      />
    );

  if (!success) return <LoadingScreen message="app.loading_database" />;

  return children;
}
